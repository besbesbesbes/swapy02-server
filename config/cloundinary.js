const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLUNDINAY_NAME,
  api_key: process.env.CLUNDINAY_API_KEY,
  api_secret: process.env.CLUNDINAY_API_SECRET,
});

module.exports = cloudinary;
