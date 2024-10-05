const prisma = require("../models");
const tryCatch = require("../utils/try-catch");
const createError = require("../utils/create-error");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports.register = tryCatch(async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;
  //validate
  if (
    !(name.trim() && email.trim() && password.trim() && confirmPassword.trim())
  ) {
    createError(400, "Please fill all data!");
  }
  if (
    !(
      typeof name == "string" &&
      typeof email == "string" &&
      typeof password == "string" &&
      typeof confirmPassword == "string"
    )
  ) {
    createError(400, "All data should be string!");
  }
  if (password !== confirmPassword) {
    createError(400, "Confirm password mismatch!");
  }
  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
    createError(400, "Email format incorrect!");
  }
  const isUserExist = await prisma.user.findUnique({
    where: {
      userName: name,
    },
  });
  if (isUserExist) {
    createError(400, "Username already exist!");
  }
  const isEmailExist = await prisma.user.findUnique({
    where: {
      userEmail: email,
    },
  });
  if (isEmailExist) {
    createError(400, "Email already exist!");
  }
  //hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  //generate display name
  const displayName = name.slice(0, 3) + "*" + name.slice(-2);
  //insert db create new user
  const newUser = await prisma.user.create({
    data: {
      userName: name,
      userDisplayName: displayName,
      userEmail: email,
      userPassword: hashedPassword,
    },
    select: {
      userId: true,
      userName: true,
      userEmail: true,
    },
  });
  res.json({ msg: "Register successful...", newUser });
});
module.exports.login = tryCatch(async (req, res, next) => {
  const { name, password } = req.body;
  //validate
  if (!(name.trim() && password.trim())) {
    createError(400, "Please fill all data!");
  }
  if (!(typeof name == "string" && typeof password == "string")) {
    createError(400, "All data should be string!");
  }
  const user = await prisma.user.findUnique({
    where: {
      userName: name,
    },
  });
  if (!user) {
    createError(400, "User not found!");
  }
  //compare password
  const isPasswordMatch = await bcrypt.compare(password, user.userPassword);
  if (!isPasswordMatch) {
    return createError(400, "Email or password is invalid!");
  }
  //create access token
  const token = jwt.sign({ id: user.userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
  //reuturn user
  const returnUser = await prisma.user.findUnique({
    where: {
      userId: user.userId,
    },
    select: {
      userId: true,
      userName: true,
      userIsReady: true,
      userProfilePic: true,
    },
  });
  res.json({ token, user: returnUser, msg: "Login successful..." });
});
