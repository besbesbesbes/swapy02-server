const express = require("express");
const offerRoute = express.Router();
const offerController = require("../controllers/offer-controller");
const authenticate = require("../middlewares/authenticate");

offerRoute.get("/getlist", authenticate, offerController.getOfferList);
offerRoute.get(
  "/getdetail/:offerId",
  authenticate,
  offerController.getOfferDetail
);
offerRoute.get(
  "/getmsg/:offerId",
  authenticate,
  offerController.getOfferMessage
);
offerRoute.post(
  "/createOffer/:assetId",
  authenticate,
  offerController.createOffer
);
offerRoute.post(
  "/rejectOffer/:offerId",
  authenticate,
  offerController.rejectOffer
);
offerRoute.post(
  "/acceptOffer/:offerId",
  authenticate,
  offerController.acceptOffer
);
module.exports = offerRoute;
