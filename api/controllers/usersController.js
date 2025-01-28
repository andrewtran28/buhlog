const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const asyncHandler = require("express-async-handler");
const CustomError = require("../utils/CustomError");

const createUser = asyncHandler(async (req, res) => {
  if (password !== verifyPassword) {
    return next(error);
  }

  bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
    await prisma.user.create({
      data: {
        username: req.body.username,
        password: hashedPassword,
        isAuthor: false,
      },
    });
  });
  res.status(201).json({ message: "User successfuly created." });
});

const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params.userId;
  await prisma.user.delete({
    where: { id: userId },
  });
  res.status(201).json({ message: "User successfully deleted." });
});

const loginUser = asyncHandler(async (req, res) => {});

module.exports = {
  createUser,
  deleteUser,
};
