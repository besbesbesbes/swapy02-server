const prisma = require("../models");
const tryCatch = require("../utils/try-catch");
const createError = require("../utils/create-error");
const cloudinary = require("../config/cloundinary");
const fs = require("fs/promises");
const getPublicId = require("../utils/getPublicId");
const path = require("path");

module.exports.createAsset = tryCatch(async (req, res, next) => {
  const user = req.user;
  const {
    assetName,
    assetCategory,
    assetBrand,
    assetCondition,
    assetNote,
    // assetThumbnail,
  } = req.body;
  // validate
  if (!assetName || !assetCategory || !assetCondition) {
    return createError(400, "Asset info should be provided");
  }
  const fieldsToValidate = [
    { value: assetName, name: "Asset name" },
    { value: assetCategory, name: "Asset category" },
    { value: assetBrand, name: "Asset brand" },
    { value: assetCondition, name: "Asset condition" },
    { value: assetNote, name: "Asset note" },
    // { value: assetThumbnail, name: "Asset thumbnail" },
  ];
  for (const field of fieldsToValidate) {
    if (field.value && typeof field.value !== "string") {
      return next(createError(400, `${field.name} must be a string`));
    }
  }
  //upload to cloudinary
  const haveFiles = !!req.files;
  let uploadResults = [];
  if (haveFiles) {
    for (const file of req.files) {
      try {
        const uploadResult = await cloudinary.uploader.upload(file.path, {
          overwrite: true,
          public_id: path.parse(file.path).name,
          folder: "test",
        });
        uploadResults.push(uploadResult.secure_url);
        fs.unlink(file.path);
      } catch (err) {
        return next(createError(500, "Fail to upload image"));
      }
    }
  }
  //create asset
  const newAsset = await prisma.asset.create({
    data: {
      userId: user.userId,
      assetName,
      assetCategory,
      assetBrand,
      assetCondition,
      assetNote,
      assetThumbnail: uploadResults[0],
    },
  });
  //create asset pic
  for (const rs of uploadResults) {
    await prisma.assetPic.create({
      data: {
        assetId: newAsset.assetId,
        assetPic: rs,
      },
    });
  }
  res.json({ msg: "Create asset sucessful...", newAsset });
});
module.exports.assetReady = tryCatch(async (req, res, next) => {
  const { userId } = req.user;
  const { assetId } = req.params;
  //validate
  const asset = await prisma.asset.findUnique({
    where: {
      assetId: Number(assetId),
    },
  });
  console.log(asset);
  if (asset.userId !== userId) {
    createError(400, "Asset not found or unauthorized!");
  }
  if (asset.assetStatus !== "CREATED") {
    createError(400, "Asset not in CREATED status");
  }
  //update asset status
  await prisma.asset.update({
    where: {
      assetId: Number(assetId),
    },
    data: {
      assetStatus: "READY",
    },
  });
  res.json({ msg: "Asset is ready..." });
});

module.exports.updateAsset = tryCatch(async (req, res, next) => {
  const user = req.user;
  const {
    assetId,
    assetName,
    assetCategory,
    assetBrand,
    assetCondition,
    assetNote,
    assetPics,
    picToDelete,
    // assetThumbnail,
  } = req.body;
  // validate
  if (!assetName || !assetCategory || !assetCondition) {
    return createError(400, "Asset info should be provided");
  }
  const fieldsToValidate = [
    { value: assetName, name: "Asset name" },
    { value: assetCategory, name: "Asset category" },
    { value: assetBrand, name: "Asset brand" },
    { value: assetCondition, name: "Asset condition" },
    { value: assetNote, name: "Asset note" },
    // { value: assetThumbnail, name: "Asset thumbnail" },
  ];
  for (const field of fieldsToValidate) {
    if (field.value && typeof field.value !== "string") {
      return next(createError(400, `${field.name} must be a string`));
    }
  }
  // update asset info
  await prisma.asset.update({
    where: { assetId: Number(assetId) },
    data: { assetName, assetBrand, assetCategory, assetCondition, assetNote },
  });
  // add new existing pic
  const haveFiles = !!req.files;
  let uploadResults = [];
  if (haveFiles) {
    for (const file of req.files) {
      const uploadResult = await cloudinary.uploader.upload(file.path, {
        overwrite: true,
        public_id: path.parse(file.path).name,
        folder: "test",
      });
      uploadResults.push(uploadResult.secure_url);
      fs.unlink(file.path);
    }
  }
  for (const rs of uploadResults) {
    await prisma.assetPic.create({
      data: {
        assetId: Number(assetId),
        assetPic: rs,
      },
    });
  }
  // delete existing pic
  const picToDelete_arr = JSON.parse(picToDelete);
  if (picToDelete_arr.length > 0) {
    for (const el of picToDelete_arr) {
      //delete from cloudinary
      cloudinary.uploader.destroy(getPublicId(el.assetPic));
      //delete from db
      await prisma.assetPic.delete({
        where: {
          assetPicId: el.assetPicId,
        },
      });
    }
  }
  // update thumbnail
  const assetPics_arr = JSON.parse(assetPics);
  if (assetPics_arr.length > 0) {
    //have existing
    await prisma.asset.update({
      where: { assetId: Number(assetId) },
      data: { assetThumbnail: assetPics_arr[0].assetPic },
    });
  } else {
    //from new only
    await prisma.asset.update({
      where: { assetId: Number(assetId) },
      data: { assetThumbnail: uploadResults[0] },
    });
  }
  // offer status update
  const offerAssets = await prisma.offerAsset.findMany({
    where: { assetId: Number(assetId) },
    include: {
      offer: true,
    },
  });
  for (const el of offerAssets) {
    await prisma.offer.update({
      where: {
        offerId: el.offerId,
      },
      data: {
        offerorStatus: false,
        swaperStatus: false,
      },
    });
    // add message
    let side = "";
    if (user.userId == el.offer.offerorId) {
      side = "Offeror";
    } else {
      side = "Swaper";
    }
    await prisma.message.create({
      data: {
        messageTxt: `${side} has a pending offer by update their asset.`,
        messageIsAuto: true,
        userId: user.userId,
        offerId: el.offerId,
      },
    });
  }
  res.json({ msg: "Asset update sucessful..." });
});

module.exports.deleteAsset = tryCatch(async (req, res, next) => {
  const user = req.user;
  const { assetId } = req.params;
  const asset = await prisma.asset.findUnique({
    where: {
      assetId: Number(assetId),
    },
    include: {
      assetPics: true,
    },
  });
  //validate
  if (!asset) {
    createError(400, "Asset not found!");
  }
  if (asset.assetStatus !== "READY" && asset.assetStatus !== "CREATED") {
    createError(400, "Asset not in READY or CREATED status!");
  }
  //update offer status
  const offerAssets = await prisma.offerAsset.findMany({
    where: {
      assetId: Number(assetId),
    },
    include: {
      offer: true,
    },
  });
  if (offerAssets) {
    for (const el of offerAssets) {
      await prisma.offer.update({
        where: {
          offerId: el.offerId,
        },
        data: {
          offerorStatus: false,
          swaperStatus: false,
        },
      });
      // add message
      let side = "";
      if (user.userId == el.offer.offerorId) {
        side = "Offeror";
      } else {
        side = "Swaper";
      }
      //add message
      await prisma.message.create({
        data: {
          messageTxt: `${side} has a pending offer by delete their asset.`,
          messageIsAuto: true,
          userId: user.userId,
          offerId: el.offerId,
        },
      });
    }
  }
  // console.log(asset);
  for (const el of asset.assetPics) {
    //destroy cloudinary
    cloudinary.uploader.destroy(getPublicId(el.assetPic));
    // delete from db
    await prisma.assetPic.delete({
      where: {
        assetPicId: el.assetPicId,
      },
    });
  }
  //delete asset (auto delete asset pic)
  await prisma.asset.delete({
    where: {
      assetId: asset.assetId,
    },
  });
  console.log("-----------end delete asset");
  res.json({ msg: "deleteAsset" });
});
