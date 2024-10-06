const express = require("express");
const offerAsestRoute = express.Router();
const offerAssetControlloer = require("../controllers/offer-asset-controller");
const authenticate = require("../middlewares/authenticate");

offerAsestRoute.get(
  "/:offerId/:userId",
  authenticate,
  offerAssetControlloer.getAssets
);
offerAsestRoute.post(
  "/:offerId/:assetId",
  authenticate,
  offerAssetControlloer.addAsset
);
module.exports = offerAsestRoute;
