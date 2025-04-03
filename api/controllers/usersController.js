const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const CustomError = require("../utils/customError");
const { handleValidationErrors } = require("../utils/validator");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getUserInfo = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      username: true,
      posts: {
        select: { published: true },
      },
      comments: {
        select: { id: true },
      },
    },
  });

  if (!user) {
    throw new CustomError(404, "User could not be found or does not exist.");
  }

  const publishedPostsCount = user.posts.filter((post) => post.published).length;
  const draftsCount = user.posts.length - publishedPostsCount;
  const commentsCount = user.comments.length;

  const userInfo = {
    id: user.id,
    username: user.username,
    isAuthor: publishedPostsCount > 0,
    posts: publishedPostsCount,
    drafts: draftsCount,
    comments: commentsCount,
  };

  return res.status(200).json(userInfo);
});

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
  const { password } = req.body;
  if (!req.user || !password) {
    return res.status(400).json({ message: "Password is required." });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) {
    console.error("User not found, ID: ", req.user.username);
    throw new CustomError(404, "User not found.");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    console.error("User deletion failed: Incorrect password for user:", req.user.username);
    return res.status(404).json({ message: "Incorrect password." });
  }

  await prisma.user.delete({
    where: { id: req.user.id },
  });

  res.status(200).json({ message: "User successfully deleted." });
});

module.exports = {
  getUserInfo,
  createUser,
  deleteUser,
};
