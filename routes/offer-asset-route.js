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
  "/add/:offerId/:assetId",
  authenticate,
  offerAssetControlloer.addAsset
);
offerAsestRoute.post(
  "/del/:offerId/:assetId",
  authenticate,
  offerAssetControlloer.delAsset
);
module.exports = offerAsestRoute;
