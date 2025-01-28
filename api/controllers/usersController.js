const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const { validationResult } = require("express-validator");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { generateToken } = require("../utils/auth");
const CustomError = require("../utils/customError");

const getCurrentUser = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new CustomError(401, "Not authorized to perform this action.");
  }

  res.status(200).json({
    success: true,
    user: req.user,
  });
});

const createUser = asyncHandler(async (req, res) => {
  const result = validationResult(req);
  console.log(result);
  if (result.isEmpty()) {
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
  } else {
    throw new CustomError(401, "Not authorized to perform this action.");
  }
});

const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params.userId;
  await prisma.user.delete({
    where: { id: userId },
  });
  res.status(201).json({ message: "User successfully deleted." });
});

const logInUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { username: username },
  });
  if (!user) {
    throw new CustomError(401, "Invalid username or password.");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new CustomError(401, "Invalid username or password.");
  }

  const token = generateToken(user);

  res.status(200).json({ message: "Login successful.", token });
});

const logOutUser = asyncHandler(async (req, res) => {
  if (!req.cookies.token) {
    throw new CustomError(400, "No active session was found.");
  }

  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logout successful." });
});

module.exports = {
  getCurrentUser,
  createUser,
  deleteUser,
  logInUser,
  logOutUser,
};
