const prisma = require("../models");
const tryCatch = require("../utils/try-catch");
const createError = require("../utils/create-error");

module.exports.getAssets = tryCatch(async (req, res, next) => {
  const { offerId, userId } = req.params;
  //   console.log(offerId, userId, req.user);
  const assets = await prisma.asset.findMany({
    where: {
      userId: Number(userId),
    },
  });
  const offerAssets = await prisma.offerAsset.findMany({
    where: {
      offerId: Number(offerId),
    },
  });
  const offerAssetIds = offerAssets.map((asset) => asset.assetId);
  const resultAssets = assets.filter(
    (asset) => !offerAssetIds.includes(asset.assetId)
  );
  res.json({
    msg: "Offer asset getAssets",
    assets: resultAssets,
  });
});

module.exports.addAsset = tryCatch(async (req, res, next) => {
  const { offerId, assetId } = req.params;
  const { userId } = req.user;
  //   console.log(assetId, offerId, userId);
  //validate
  const offer = await prisma.offer.findUnique({
    where: {
      offerId: Number(offerId),
      OR: [{ offerorId: userId }, { swaperId: userId }],
    },
  });
  if (!offer) {
    createError(400, "Offer not found or unauthorized!");
  }
  //addAsset
  const newOfferAsset = await prisma.offerAsset.create({
    data: {
      offerId: Number(offerId),
      assetId: Number(assetId),
    },
    include: {
      asset: true,
      offer: true,
    },
  });
  //patchOffer
  await prisma.offer.update({
    where: {
      offerId: Number(offerId),
    },
    data: {
      offerorStatus: false,
      swaperStatus: false,
    },
  });
  res.json({
    msg: "Offer asset addAsset",
    newOfferAsset,
  });
});

module.exports.delAsset = tryCatch(async (req, res, next) => {
  const { offerId, assetId } = req.params;
  const { userId } = req.user;
  // console.log(assetId, offerId, userId);
  //validate
  const offer = await prisma.offer.findUnique({
    where: {
      offerId: Number(offerId),
      OR: [{ offerorId: userId }, { swaperId: userId }],
    },
  });
  if (!offer) {
    createError(400, "Offer not found or unauthorized!");
  }
  //delAsset
  const delOfferAsset = await prisma.offerAsset.findFirst({
    where: {
      offerId: Number(offerId),
      assetId: Number(assetId),
    },
    include: {
      asset: true,
      offer: true,
    },
  });
  if (!delOfferAsset) {
    createError(400, "Offer not found");
  }
  console.log(delOfferAsset.assetId);
  await prisma.offerAsset.delete({
    where: {
      offerAssetId: delOfferAsset.offerAssetId,
    },
  });
  //patchOffer
  await prisma.offer.update({
    where: {
      offerId: Number(offerId),
    },
    data: {
      offerorStatus: false,
      swaperStatus: false,
    },
  });
  res.json({
    msg: "Offer asset delAsset",
    delOfferAsset,
  });
});
