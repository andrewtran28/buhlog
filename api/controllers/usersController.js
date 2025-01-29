const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const CustomError = require("../utils/customError");
const { handleValidationErrors } = require("../utils/validator");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createUser = asyncHandler(async (req, res) => {
  handleValidationErrors(req);

  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  await prisma.user.create({
    data: {
      username: req.body.username,
      password: hashedPassword,
      isAuthor: Boolean(req.body.isAuthor).valueOf(), //ensures value is boolean
    },
  });

  res.status(201).json({ message: "User successfully created." });
});

const deleteUser = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new CustomError(401, "Not authorized to perform this action.");
  }

  await prisma.user.delete({
    where: { id: req.user.id },
  });

  res.status(200).json({ message: "User successfully deleted." });
});

module.exports = {
  createUser,
  deleteUser,
};
