const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const asyncHandler = require("express-async-handler");
const CustomError = require("../utils/CustomError");

function formatDate(date) {
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
  const post = await prisma.posts.findUnique({
    where: { title: postTitle },
  });

  if (!post) {
    throw new CustomError(404, "Post not found.");
  }

  return post;
}

const getAllPosts = asyncHandler(async (req, res) => {
  const posts = await prisma.posts.findMany({
    where: { published: true },
  });

  if (!posts || post.length == 0) {
    throw new CustomError(404, "No posts have been published.");
  }

  const formattedPosts = posts.map((post) => ({
    ...post,
    createdAt: formatDate(post.createdAt),
  }));
  res.status(200).json(formattedPosts);
});

const getPostByTitle = asyncHandler(async (req, res) => {
  const postTitle = decodeURIComponent(req.params.postTitle);
  const post = await findPostByTitle(postTitle);

  res.status(200).json(post);
});

const createPost = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new CustomError(401, "Not authorized to perform this action.");
  }

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
      published: req.body.published,
      userId: user.id,
    },
  });

  res.status(200).json({ message: "Post created." });
});

const deletePost = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new CustomError(401, "Not authorized to perform this action.");
  }

  await prisma.post.delete({
    where: { id: parseInt(req.params.postId) },
  });

  res.status(200).json({ message: "Post was successfully delted." });
});

const editPost = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new CustomError(401, "You're not authorized to perform this operation.");
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  if (!user.isAuthor) {
    throw new CustomError(403, "User role must be Author to perform this action.");
  }

  const post = await prisma.post.update({
    where: { id: parseInt(req.params.postId) },
    data: {
      title: req.body.title,
      content: req.body.content,
      published: req.body.published,
      userId: user.id,
    },
  });

  res.status(200).json({ message: "Post successfully edited." });
});

const getComments = asyncHandler(async (req, res) => {
  const postTitle = decodeURIComponent(req.params.postTitle);
  const post = await findPostByTitle(postTitle);

  const comments = await prisma.comments.findMany({
    where: { postId: post.id },
  });

  res.status(201).json(comments);
});

const createComment = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new CustomError(401, "Not authorized to perform this action.");
  }

  const postTitle = decodeURIComponent(req.params.postTitle);
  const post = await findPostByTitle(postTitle);

  await prisma.comments.create({
    data: {
      text: req.body.text,
      userId: req.user.id,
      postId: post.id,
    },
  });
});

const deleteComment = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new CustomError(401, "Not authorized to perform this action.");
  }

  const commentId = parseInt(req.params.commentId, 10);
  const comment = await prisma.comments.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    throw new CustomError(404, "Comment not found.");
  }

  if (comment.userId !== req.user.id) {
    throw new CustomError(403, "You are not authorized to delete this comment.");
  }

  await prisma.comments.delete({
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
  deleteComment,
};
