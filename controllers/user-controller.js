const prisma = require("../models");
const tryCatch = require("../utils/try-catch");
const createError = require("../utils/create-error");

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
  if (
    updatedUser.userDisplayName !== null &&
    updatedUser.userDisplayName !== "" &&
    updatedUser.userBio !== null &&
    updatedUser.userBio !== "" &&
    updatedUser.userProfilePic !== null &&
    updatedUser.userProfilePic !== "" &&
    updatedUser.userLocation !== null &&
    updatedUser.userLocation !== "" &&
    updatedUser.userAddress !== null &&
    updatedUser.userAddress
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
