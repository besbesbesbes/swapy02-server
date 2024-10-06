const prisma = require("../models");
const tryCatch = require("../utils/try-catch");
const createError = require("../utils/create-error");

module.exports.addMsg = tryCatch(async (req, res, next) => {
  const { userId } = req.user;
  const { messageTxt, messageIsAuto, userId: userIdBody, offerId } = req.body;
  //validate
  if (!(messageTxt && userIdBody && offerId)) {
    createError(400, "Provide all data!");
  }
  if (userId !== Number(userIdBody)) {
    createError(401, "User unauthorizec!");
  }
  const offer = await prisma.offer.findUnique({
    where: {
      offerId: Number(offerId),
      OR: [{ offerorId: userId }, { swaperId: userId }],
    },
  });
  if (!offer) {
    createError(400, "Offer not found!");
  }
  //add msg
  const isAuto = messageIsAuto === "true" ? true : false;
  const newMsg = await prisma.message.create({
    data: {
      messageTxt,
      messageIsAuto: isAuto,
      userId,
      offerId: Number(offerId),
    },
  });
  res.json({ msg: "addMsg", newMsg });
});
