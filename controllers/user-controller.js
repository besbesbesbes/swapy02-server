const prisma = require("../models");
const path = require("path");
const tryCatch = require("../utils/try-catch");
const createError = require("../utils/create-error");
const bcrypt = require("bcryptjs");
const cloudinary = require("../config/cloundinary");
const fs = require("fs/promises");
const getPublicId = require("../utils/getPublicId");

module.exports.userInfo = tryCatch(async (req, res, next) => {
  const returnUser = await prisma.user.findUnique({
    where: {
      userId: req.user.userId,
    },
  });
  if (!returnUser) {
    createError(400, "User not found!");
  }
  const { userPassword, ...restUser } = returnUser;
  res.json({ user: restUser, msg: "Get user info successful..." });
});
module.exports.updateUserInfo = tryCatch(async (req, res, next) => {
  const {
    userDisplayName,
    userBio,
    userProfilePic,
    userLocation,
    userAddress,
  } = req.body;
  //validate
  const fieldsToValidate = [
    { value: userDisplayName, name: "Display Name" },
    { value: userBio, name: "User bio" },
    { value: userProfilePic, name: "Profile pic" },
    { value: userLocation, name: "Location" },
    { value: userAddress, name: "Address" },
  ];

  for (const field of fieldsToValidate) {
    if (field.value && typeof field.value !== "string") {
      return next(createError(400, `${field.name} must be a string!`));
    }
  }
  if (userDisplayName.length < 6) {
    return createError(400, "Display name at least 6 charactors!");
  }

  const user = await prisma.user.findUnique({
    where: {
      userId: req.user.userId,
    },
  });
  if (!user) {
    return createError(400, "User not found!");
  }
  //update user
  const updatedUser = await prisma.user.update({
    where: {
      userId: user.userId,
    },
    data: {
      userDisplayName,
      userBio,
      userProfilePic,
      userLocation,
      userAddress,
    },
  });
  //check user ready
  const userProfilePicName = updatedUser.userProfilePic.split("/").pop();
  if (
    updatedUser.userDisplayName !== null &&
    updatedUser.userDisplayName !== "" &&
    updatedUser.userBio !== null &&
    updatedUser.userBio !== "" &&
    updatedUser.userProfilePic !== null &&
    updatedUser.userProfilePic !== "" &&
    userProfilePicName !== "user-pic-default.png" &&
    updatedUser.userLocation !== null &&
    updatedUser.userLocation !== "" &&
    updatedUser.userAddress !== null &&
    updatedUser.userAddress !== ""
  ) {
    await prisma.user.update({
      where: {
        userId: updatedUser.userId,
      },
      data: {
        userIsReady: true,
      },
    });
  } else {
    await prisma.user.update({
      where: {
        userId: updatedUser.userId,
      },
      data: {
        userIsReady: false,
      },
    });
  }
  //return user
  const returnUser = await prisma.user.findUnique({
    where: {
      userId: updatedUser.userId,
    },
    select: {
      userId: true,
      userName: true,
      userIsReady: true,
      userProfilePic: true,
    },
  });

  res.json({ user: returnUser, msg: "User update successful..." });
});
module.exports.changePassword = tryCatch(async (req, res, next) => {
  const { userId } = req.user;
  const { curPwd, newPwd, cnewPwd } = req.body;
  //validate
  if (!(curPwd.trim() && newPwd.trim() && cnewPwd.trim())) {
    createError(400, "Please fill all data!");
  }
  if (
    !(
      typeof curPwd == "string" &&
      typeof newPwd == "string" &&
      typeof cnewPwd == "string"
    )
  ) {
    createError(400, "All data should be string!");
  }
  const user = await prisma.user.findUnique({
    where: {
      userId,
    },
  });
  if (!user) {
    createError(400, "User not found!");
  }
  //compare password
  if (newPwd !== cnewPwd) {
    createError(400, "New password not matched!");
  }
  const isPasswordMatch = await bcrypt.compare(curPwd, user.userPassword);
  if (!isPasswordMatch) {
    createError(400, "Password is invalid!");
  }
  //hash password
  const hashedPassword = await bcrypt.hash(newPwd, 10);
  //update user
  const newUser = await prisma.user.update({
    where: {
      userId,
    },
    data: {
      userPassword: hashedPassword,
    },
    select: {
      userId: true,
      userName: true,
      userEmail: true,
    },
  });
  res.json({ msg: "Change Password", newUser });
});

module.exports.changeProfilePic = tryCatch(async (req, res, next) => {
  const { userId } = req.user;
  //validate
  const user = await prisma.user.findUnique({
    where: {
      userId,
    },
  });
  if (!user) {
    createError(400, "User not found!");
  }
  if (user.userId !== userId) {
    createError(401, "Unauthorized!");
  }
  //start upload file
  const haveFile = !!req.file;
  let uploadResult = {};
  if (haveFile) {
    uploadResult = await cloudinary.uploader.upload(req.file.path, {
      overwrite: true,
      public_id: path.parse(req.file.path).name,
      folder: "test",
    });
    fs.unlink(req.file.path);
    const userProfilePicName = user.userProfilePic.split("/").pop();
    if (user.userProfilePic && userProfilePicName !== "user-pic-default.png") {
      cloudinary.uploader.destroy(getPublicId(user.userProfilePic));
    }
  }
  await prisma.user.update({
    where: {
      userId,
    },
    data: {
      userProfilePic: uploadResult.secure_url || "",
    },
  });
  const returnUser = await prisma.user.findUnique({
    where: {
      userId,
    },
    select: {
      userId: true,
      userName: true,
      userIsReady: true,
      userProfilePic: true,
    },
  });
  res.json({ msg: "Change profile picture successful...", returnUser });
});
