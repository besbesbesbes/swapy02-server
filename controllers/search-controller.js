const prisma = require("../models");
const tryCatch = require("../utils/try-catch");

module.exports.searchBy = tryCatch(async (req, res, next) => {
  const { v, c, i, a } = req.query;
  const assets = await prisma.asset.findMany({
    where: {
      assetName: {
        contains: v || "",
      },
      assetCategory: c || undefined,
      userId: i ? Number(i) : undefined,
      assetId: a ? Number(a) : undefined,
      assetIsReady: true,
      user: {
        userIsReady: true,
      },
    },
    orderBy: {
      assetId: "desc",
    },
    include: {
      assetPics: true,
      user: {
        select: {
          userId: true,
          userDisplayName: true,
          userProfilePic: true,
          userLocation: true,
          userRating: true,
          userRatingCount: true,
        },
      },
    },
  });
  res.json({ msg: "Search by successfull...", assets });
});

module.exports.searchHighlight = tryCatch(async (req, res, next) => {
  const assets = await prisma.asset.findMany({
    where: {
      assetIsReady: true,
      user: {
        userIsReady: true,
      },
    },
    include: {
      assetPics: true,
      user: {
        select: {
          userId: true,
          userDisplayName: true,
          userProfilePic: true,
          userLocation: true,
          userRating: true,
          userRatingCount: true,
        },
      },
    },
  });
  const assetsWithCounts = assets.map((asset) => ({
    ...asset,
    totalOfferorSwaperCount: asset.assetOfferorCount + asset.assetSwaperCount,
  }));
  const sortedAssets = assetsWithCounts.sort(
    (a, b) => b.totalOfferorSwaperCount - a.totalOfferorSwaperCount
  );
  const topAssets = sortedAssets.slice(0, 3);
  res.json({ msg: "Search highlight successful...", assets: topAssets });
});
