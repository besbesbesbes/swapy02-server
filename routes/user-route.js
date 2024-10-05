const express = require("express");
const userRoute = express.Router();
const uesrController = require("../controllers/user-controller");
const authenticate = require("../middlewares/authenticate");

userRoute.get("/", authenticate, uesrController.userInfo);
userRoute.patch("/update-user", authenticate, uesrController.updateUserInfo);

module.exports = userRoute;
