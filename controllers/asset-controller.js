const prisma = require("../models");
const tryCatch = require("../utils/try-catch");
const createError = require("../utils/create-error");

module.exports.createAsset = tryCatch(async (req, res, next) => {
  const user = req.user;
  const {
    assetName,
    assetCategory,
    assetBrand,
    assetCondition,
    assetNote,
    assetThumbnail,
  } = req.body;
  // validate
  if (!assetName || !assetCategory || !assetCondition || !assetThumbnail) {
    return createError(400, "Asset info should be provided");
  }
  const fieldsToValidate = [
    { value: assetName, name: "Asset name" },
    { value: assetCategory, name: "Asset category" },
    { value: assetBrand, name: "Asset brand" },
    { value: assetCondition, name: "Asset condition" },
    { value: assetNote, name: "Asset note" },
    { value: assetThumbnail, name: "Asset thumbnail" },
  ];
  for (const field of fieldsToValidate) {
    if (field.value && typeof field.value !== "string") {
      return next(createError(400, `${field.name} must be a string`));
    }
  }
  //create asset
  const updatedAsset = await prisma.asset.create({
    data: {
      userId: user.userId,
      assetName,
      assetCategory,
      assetBrand,
      assetCondition,
      assetNote,
      assetThumbnail,
    },
  });
  res.json({ msg: "Create asset sucessful...", assets: updatedAsset });
});

module.exports.updateAsset = tryCatch(async (req, res, next) => {
  res.json({ msg: "updateAsset" });
});
module.exports.deleteAsset = tryCatch(async (req, res, next) => {
  res.json({ msg: "deleteAsset" });
});
