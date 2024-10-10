const express = require("express");
const shippingRoute = express.Router();
const shippingController = require("../controllers/shipping-controller");
const authenticate = require("../middlewares/authenticate");

shippingRoute.get("/getShipping", authenticate, shippingController.getShipping);
shippingRoute.post(
  "/assetShipped/:assetId",
  authenticate,
  shippingController.assetShipped
);
shippingRoute.post(
  "/assetReceived/:assetId",
  authenticate,
  shippingController.assetReceived
);
shippingRoute.get(
  "/userRate/:userForRateId",
  authenticate,
  shippingController.getUserRate
);

shippingRoute.post(
  "/rateUser/:userForRateId/:userRate/:assetId",
  authenticate,
  shippingController.rateUser
);

module.exports = shippingRoute;
