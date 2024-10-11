const express = require("express");
const assetRoute = express.Router();
const assetController = require("../controllers/asset-controller");
const authenticate = require("../middlewares/authenticate");
const upload = require("../middlewares/upload");

assetRoute.post(
  "/",
  authenticate,
  upload.array("images", 10),
  assetController.createAsset
);
assetRoute.patch("/", authenticate, assetController.updateAsset);
assetRoute.delete("/", authenticate, assetController.deleteAsset);
assetRoute.post(
  "/assetReady/:assetId",
  authenticate,
  assetController.assetReady
);
module.exports = assetRoute;
