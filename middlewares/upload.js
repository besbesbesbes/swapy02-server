const path = require("path");
const fs = require("fs");
const multer = require("multer");

const uploadDirectory = path.join(process.cwd(), "public", "upload-pic");
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDirectory),
  filename: (req, file, cb) => {
    const { userId } = req.user;
    const fullFilename = `${userId}_${Date.now()}_${Math.round(
      Math.random() * 1000
    )}${path.extname(file.originalname)}`;
    cb(null, fullFilename);
  },
});

module.exports = multer({ storage });
