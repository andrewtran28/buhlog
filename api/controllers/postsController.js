const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const asyncHandler = require("express-async-handler");
const CustomError = require("../utils/customError");
const { handleValidationErrors } = require("../utils/validator");

function formatDate(date) {
  if (!date || isNaN(date.getTime())) {
    return ""; // Return an empty string or handle the error appropriately
  }

  const options = { month: "short" };
  const month = new Intl.DateTimeFormat("en-US", options).format(date);
  const day = date.getDate();
  const year = date.getFullYear();
  const hours = date.getHours() % 12 || 12; // Convert to 12-hour format
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = date.getHours() < 12 ? "AM" : "PM";

  const timezone = new Intl.DateTimeFormat("en-US", { timeZoneName: "short" }).format(date).split(" ").pop();

  return `${month} ${day}, ${year} @ ${hours}:${minutes}${ampm} ${timezone}`;
}

async function findPostByTitle(postTitle) {
  const post = await prisma.post.findUnique({
    where: { title: postTitle },
  });

  if (!post) {
    throw new CustomError(404, "Post not found.");
  }

  return post;
}

const getAllPosts = asyncHandler(async (req, res) => {
  const posts = await prisma.post.findMany({ where: { published: true } });

  if (!posts || posts.length === 0) {
    throw new CustomError(404, "No posts have been published.");
  }

  const formattedPosts = posts.map((post) => ({
    ...post,
    createdAt: formatDate(post.createdAt),
    updatedAt: formatDate(post.updatedAt),
  }));

  res.status(200).json(formattedPosts);
});

const getPostByTitle = asyncHandler(async (req, res) => {
  const postTitle = decodeURIComponent(req.params.postTitle);
  const post = await findPostByTitle(postTitle);

  res.status(200).json(post);
});

const createPost = asyncHandler(async (req, res) => {
  handleValidationErrors(req);

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  if (!user) {
    throw new CustomError(404, "User could not be found or does not exist.");
  }

  if (!user.isAuthor) {
    throw new CustomError(403, "User role must be Author to perform this action.");
  }

  await prisma.post.create({
    data: {
      title: req.body.title,
      content: req.body.content,
      published: Boolean(req.body.published).valueOf(),
      userId: user.id,
    },
  });

  res.status(200).json({ message: "Post created." });
});

const deletePost = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  if (!user.isAuthor) {
    throw new CustomError(403, "User role must be Author to perform this action.");
  }

  await prisma.post.delete({
    where: { id: parseInt(req.params.postId) },
  });

  res.status(200).json({ message: "Post was successfully delted." });
});

const editPost = asyncHandler(async (req, res) => {
  handleValidationErrors(req);

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  if (!user.isAuthor) {
    throw new CustomError(403, "User role must be Author to perform this action.");
  }

  const postTitle = decodeURIComponent(req.params.postTitle);
  const post = await findPostByTitle(postTitle);

  await prisma.post.update({
    where: { id: parseInt(post.id) },
    data: {
      title: req.body.title,
      content: req.body.content,
      published: Boolean(req.body.published).valueOf(),
      updatedAt: new Date(),
    },
  });

  res.status(200).json({ message: `Post: ${post.title} was successfully edited.` });
});

const getComments = asyncHandler(async (req, res) => {
  const postTitle = decodeURIComponent(req.params.postTitle);
  const post = await findPostByTitle(postTitle);

  const comments = await prisma.comment.findMany({
    where: { postId: post.id },
  });

  res.status(201).json(comments);
});

const createComment = asyncHandler(async (req, res) => {
  handleValidationErrors(req);
  const postTitle = decodeURIComponent(req.params.postTitle);
  const post = await findPostByTitle(postTitle);

  if (!post) {
    throw new CustomError(404, "Post not found.");
  }

  await prisma.comment.create({
    data: {
      text: req.body.text,
      userId: req.user.id,
      postId: post.id,
    },
  });

  res.status(201).json({ message: "Comment created successfully." });
});

const editComment = asyncHandler(async (req, res) => {
  handleValidationErrors(req);

  const commentId = parseInt(req.params.commentId, 10);
  if (isNaN(commentId)) {
    throw new CustomError(400, "Invalid comment ID.");
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    throw new CustomError(404, "Comment not found.");
  }

  if (comment.userId !== req.user.id) {
    throw new CustomError(403, "You are not authorized to edit this comment.");
  }

  await prisma.comment.update({
    where: { id: commentId },
    data: {
      text: req.body.text,
      updatedAt: new Date(),
    },
  });

  res.status(201).json({ message: "Comment successfully edited." });
});

const deleteComment = asyncHandler(async (req, res) => {
  const commentId = parseInt(req.params.commentId, 10);
  if (isNaN(commentId)) {
    throw new CustomError(400, "Invalid comment ID.");
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    throw new CustomError(404, "Comment not found.");
  }

  if (comment.userId !== req.user.id) {
    throw new CustomError(403, "You are not authorized to delete this comment.");
  }

  await prisma.comment.delete({
    where: { id: commentId },
  });

  res.status(200).json({ message: "Comment deleted successfully." });
});

module.exports = {
  getAllPosts,
  getPostByTitle,
  createPost,
  deletePost,
  editPost,
  getComments,
  createComment,
  editComment,
  deleteComment,
};
