const express = require("express");
const searchRoute = express.Router();
const searchController = require("../controllers/search-controller");

searchRoute.get("/", searchController.searchBy);
searchRoute.get("/all", searchController.searchAll);
searchRoute.get("/highlight", searchController.searchHighlight);
module.exports = searchRoute;
