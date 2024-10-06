const prisma = require("../models");
const tryCatch = require("../utils/try-catch");
const createError = require("../utils/create-error");

module.exports.getOfferList = tryCatch(async (req, res, next) => {
  const { userId } = req.user;
  const offers = await prisma.offer.findMany({
    where: {
      OR: [{ offerorId: userId }, { swaperId: userId }],
    },
    orderBy: {
      offerId: "desc",
    },
  });

  res.json({ msg: "getOfferList", offers });
});
module.exports.getOfferDetail = tryCatch(async (req, res, next) => {
  const { userId } = req.user;
  const { offerId } = req.params;
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
  //return offerDetail
  const returnOffer = await prisma.offer.findUnique({
    where: {
      offerId: offer.offerId, // Ensure the offerId exists and is correct
    },
    include: {
      offeror: {
        select: {
          userId: true,
          userDisplayName: true,
          userProfilePic: true,
          userLocation: true,
          userRating: true,
          userRatingCount: true,
        },
      },
      swaper: {
        select: {
          userId: true,
          userDisplayName: true,
          userProfilePic: true,
          userLocation: true,
          userRating: true,
          userRatingCount: true,
        },
      },
      offerAssets: {
        include: {
          asset: {
            select: {
              assetId: true,
              assetName: true,
              assetCategory: true,
              assetCondition: true,
              assetThumbnail: true,
              userId: true,
            },
          },
        },
      },
    },
  });
  res.json({ meg: "getOfferDetail", returnOffer });
});
module.exports.getOfferMessage = tryCatch(async (req, res, next) => {
  const { userId } = req.user;
  const { offerId } = req.params;
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
  //return offerDetail
  const returnOffer = await prisma.offer.findUnique({
    where: {
      offerId: offer.offerId, // Ensure the offerId exists and is correct
    },
    include: {
      offeror: {
        select: {
          userId: true,
          userDisplayName: true,
          userProfilePic: true,
          userLocation: true,
          userRating: true,
          userRatingCount: true,
        },
      },
      swaper: {
        select: {
          userId: true,
          userDisplayName: true,
          userProfilePic: true,
          userLocation: true,
          userRating: true,
          userRatingCount: true,
        },
      },
      messages: true,
    },
  });
  res.json({ meg: "getOfferDetail", returnOffer });
});
