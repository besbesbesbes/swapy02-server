require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const errorMiddleware = require("./middlewares/error");
const notFound = require("./middlewares/not-found");
const authRoute = require("./routes/auth-route");
const userRoute = require("./routes/user-route");
const searchRoute = require("./routes/search-route");
const assetRoute = require("./routes/asset-route");
const offerRoute = require("./routes/offer-route");
const msgRoute = require("./routes/msg-route");
const offerAsestRoute = require("./routes/offer-asset-route");

//middleware
app.use(cors());
app.use(express.json());

//routing
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/search", searchRoute);
app.use("/api/asset", assetRoute);
app.use("/api/offer", offerRoute);
app.use("/api/msg", msgRoute);
app.use("/api/offer/asset", offerAsestRoute);
app.use(notFound);
app.use(errorMiddleware);

//start server
const port = process.env.PORT || 8009;
app.listen(port, () => console.log("SERVER ON: ", port));
