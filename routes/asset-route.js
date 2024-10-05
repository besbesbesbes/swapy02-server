const express = require("express");
const assetRoute = express.Router();
const assetController = require("../controllers/asset-controller");
const authenticate = require("../middlewares/authenticate");

assetRoute.post("/", authenticate, assetController.createAsset);
assetRoute.patch("/", authenticate, assetController.updateAsset);
assetRoute.delete("/", authenticate, assetController.deleteAsset);
module.exports = assetRoute;
