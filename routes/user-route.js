const express = require("express");
const userRoute = express.Router();
const uesrController = require("../controllers/user-controller");
const authenticate = require("../middlewares/authenticate");
const upload = require("../middlewares/upload");

userRoute.get("/", authenticate, uesrController.userInfo);
userRoute.patch("/update-user", authenticate, uesrController.updateUserInfo);
userRoute.post("/change-password", authenticate, uesrController.changePassword);
userRoute.post(
  "/change-profilepic",
  authenticate,
  upload.single("image"),
  uesrController.changeProfilePic
);

module.exports = userRoute;
