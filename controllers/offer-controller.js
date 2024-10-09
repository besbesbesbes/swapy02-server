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
  // console.log(returnOffer);
  res.json({ msg: "getOfferDetail", returnOffer });
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
  res.json({ msg: "getOfferDetail", returnOffer });
});

module.exports.createOffer = tryCatch(async (req, res) => {
  const { assetId } = req.params;
  //validate
  const asset = await prisma.asset.findUnique({
    where: {
      assetId: +assetId,
    },
  });
  if (!asset || !asset.assetIsReady) {
    createError(400, "Asset not found or not ready to use!");
  }
  const offerName =
    req.user.userName.slice(0, 3) +
    "*" +
    req.user.userName.slice(-2) +
    asset.assetName.slice(0, 3) +
    "*" +
    asset.assetName.slice(-2);
  //create new offer
  const data = {
    offerName: offerName,
    offerorId: req.user.userId,
    swaperId: asset.userId,
  };
  const offer = await prisma.offer.create({
    data: data,
  });
  console.log(offer);
  //create new asset offer
  const assetOffer = await prisma.offerAsset.create({
    data: {
      offerId: offer.offerId,
      assetId: +assetId,
    },
  });
  //return offer
  const returnOffer = await prisma.offer.findUnique({
    where: {
      offerId: offer.offerId,
    },
    include: {
      offerAssets: {
        include: {
          asset: true,
        },
      },
    },
  });
  res.json({ msg: "Create new Offer", returnOffer });
});
module.exports.rejectOffer = tryCatch(async (req, res) => {
  const { offerId } = req.params;
  const { userId } = req.user;
  //validate
  const offer = await prisma.offer.findUnique({
    where: {
      offerId: Number(offerId),
      OR: [{ offerorId: userId }, { swaperId: userId }],
    },
  });
  if (!offer) {
    createError(400, "Offer not found or unautorinzed!");
  }
  //reject offer
  const returnOffer = await prisma.offer.update({
    where: {
      offerId: offer.offerId,
    },
    data: {
      offerStatus: "REJECTED",
    },
  });
  res.json({ msg: "Reject Offer", returnOffer });
});
module.exports.acceptOffer = tryCatch(async (req, res) => {
  res.json({ msg: "Accept Offer" });
});
