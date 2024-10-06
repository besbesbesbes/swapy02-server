const express = require("express");
const msgRoute = express.Router();
const msgController = require("../controllers/msg-controller");
const authenticate = require("../middlewares/authenticate");

msgRoute.post("/", authenticate, msgController.addMsg);

module.exports = msgRoute;
