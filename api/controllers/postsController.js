const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const asyncHandler = require("express-async-handler");
const CustomError = require("../utils/customError");
const { handleValidationErrors } = require("../utils/validator");
const DOMPurify = require("isomorphic-dompurify");

const getAllPosts = asyncHandler(async (req, res) => {
  const posts = await prisma.post.findMany({
    where: { published: true },
    include: {
      comments: true,
      user: {
        select: { username: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  posts.forEach((post) => {
    post.author = post.user.username;
    delete post.user;
  });

  if (!posts || posts.length === 0) {
    throw new CustomError(404, "No posts have been published.");
  }

  res.status(200).json(posts);
});

const getAllDrafts = asyncHandler(async (req, res) => {
  const drafts = await prisma.post.findMany({
    where: { published: false, userId: req.user.id },
    orderBy: { createdAt: "desc" },
  });

  if (!drafts || drafts.length === 0) {
    return;
  }

  res.status(200).json(drafts);
});

const getPostByTitle = asyncHandler(async (req, res) => {
  const postTitle = decodeURIComponent(req.params.postTitle);
  const post = await prisma.post.findUnique({
    where: { title: postTitle },
    include: {
      comments: true,
      user: {
        select: { username: true },
      },
    },
  });

  if (!post) {
    throw new CustomError(404, "Post not found.");
  }

  post.author = post.user.username;
  delete post.user;

  res.status(200).json(post);
});

const getPostById = asyncHandler(async (req, res) => {
  const postId = parseInt(req.params.postId);
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      user: {
        select: { username: true },
      },
    },
  });

  if (!post) {
    throw new CustomError(404, "Post not found.");
  }

  post.author = post.user.username;
  delete post.user;

  res.status(200).json(post);
});

const createPost = asyncHandler(async (req, res) => {
  handleValidationErrors(req);

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) {
    throw new CustomError(404, "User could not be found or does not exist.");
  }

  if (!user.isAuthor) {
    throw new CustomError(403, "User role must be Author to perform this action.");
  }

  const sanitizedContent = DOMPurify.sanitize(req.body.content);

  await prisma.post.create({
    data: {
      title: req.body.title,
      content: sanitizedContent,
      published: Boolean(req.body.published).valueOf(),
      userId: user.id,
      updatedAt: new Date(),
    },
  });

  res.status(200).json({ message: "Post created." });
});

const deletePost = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user.isAuthor) {
    throw new CustomError(403, "User role must be Author to perform this action.");
  }

  await prisma.post.delete({
    where: { id: parseInt(req.params.postId) },
  });

  res.status(200).json({ message: "Post was successfully deleted." });
});

const editPost = asyncHandler(async (req, res) => {
  handleValidationErrors(req);

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user.isAuthor) {
    throw new CustomError(403, "User role must be Author to perform this action.");
  }

  const postId = parseInt(req.params.postId);
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    throw new CustomError(404, "Post not found.");
  }

  if (post.userId !== user.id) {
    throw new CustomError(403, "You are not the author of this post.");
  }

  const isPublishing = req.body.published === true && post.published === false;
  const updatedPost = await prisma.post.update({
    where: { id: postId },
    data: {
      title: req.body.title || post.title,
      content: req.body.content || post.content,
      published: req.body.published === undefined ? post.published : Boolean(req.body.published),
      createdAt: isPublishing ? new Date() : post.createdAt, // Update only if publishing
    },
  });

  res.status(200).json({ message: `Post: ${updatedPost.title} was successfully edited.`, post: updatedPost });
});

module.exports = {
  getAllPosts,
  getAllDrafts,
  getPostByTitle,
  getPostById,
  createPost,
  deletePost,
  editPost,
};
