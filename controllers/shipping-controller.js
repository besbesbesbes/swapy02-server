const prisma = require("../models");
const tryCatch = require("../utils/try-catch");
const createError = require("../utils/create-error");

module.exports.getShipping = tryCatch(async (req, res, next) => {
  const { userId } = req.user;
  const offers = await prisma.offer.findMany({
    where: {
      OR: [{ offerorId: userId }, { swaperId: userId }],
      offerStatus: "ACCEPTED",
    },
    include: {
      offerAssets: {
        include: {
          asset: true,
        },
      },
    },
  });
  let assets = [];
  for (const offer of offers) {
    offer.offerAssets.forEach((offerAsset) => {
      assets.push(offerAsset);
    });
  }
  res.json({ msg: "getShipping", assets });
});
module.exports.assetShipped = tryCatch(async (req, res) => {
  const { assetId } = req.params;
  const { userId } = req.user;
  console.log(assetId, userId);
  //validate
  const asset = await prisma.asset.findUnique({
    where: {
      assetId: +assetId,
      userId,
    },
  });
  if (!asset) {
    createError(400, "Asset not found or unauthorized!");
  }
  //patch asset status = "Shipped"
  const returnAsset = await prisma.asset.update({
    where: {
      assetId: +assetId,
    },
    data: {
      assetStatus: "SHIPPED",
    },
  });
  res.json({ msg: "Asset Ship", returnAsset });
});

module.exports.assetReceived = tryCatch(async (req, res) => {
  const { assetId } = req.params;
  const { userId } = req.user;
  console.log(assetId, userId);
  //validate
  const asset = await prisma.asset.findUnique({
    where: {
      assetId: +assetId,
    },
  });
  if (!asset) {
    createError(400, "Asset not found or unauthorized!");
  }
  //patch asset status = "Shipped"
  const returnAsset = await prisma.asset.update({
    where: {
      assetId: +assetId,
    },
    data: {
      assetStatus: "RECEIVED",
    },
  });
  res.json({ msg: "Asset Received", returnAsset });
});

module.exports.getUserRate = tryCatch(async (req, res) => {
  const { userForRateId } = req.params;
  const user = await prisma.user.findUnique({
    where: {
      userId: Number(userForRateId),
    },
  });
  res.json({ msg: "User Rating", user });
});

module.exports.rateUser = tryCatch(async (req, res) => {
  const { userForRateId, userRate, assetId } = req.params;
  console.log(userForRateId, userRate, assetId);
  const user = await prisma.user.findUnique({
    where: {
      userId: Number(userForRateId),
    },
  });
  const newRating =
    (+user.userRating * +user.userRatingCount + +userRate) /
    (+user.userRatingCount + 1);
  const newRatingCount = +user.userRatingCount + 1;
  //update user
  await prisma.user.update({
    where: {
      userId: Number(userForRateId),
    },
    data: {
      userRating: newRating,
      userRatingCount: newRatingCount,
    },
  });
  //update asset
  await prisma.asset.update({
    where: {
      assetId: Number(assetId),
    },
    data: {
      assetUserIsRate: true,
    },
  });
  res.json({ msg: "Rate User" });
});
