const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const asyncHandler = require("express-async-handler");
const CustomError = require("../utils/customError");
const { handleValidationErrors } = require("../utils/validator");

const getComments = asyncHandler(async (req, res) => {
  const postSlug = decodeURIComponent(req.params.postSlug);
  const post = await prisma.post.findUnique({ where: { slug: postSlug } });

  if (!post) {
    throw new CustomError(404, "Post not found.");
  }

  const comments = await prisma.comment.findMany({
    where: { postId: post.id },
    include: {
      user: {
        select: { username: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  comments.forEach((comment) => {
    comment.username = comment.user.username;
    delete comment.user;
  });

  res.status(200).json(comments);
});

const createComment = asyncHandler(async (req, res) => {
  handleValidationErrors(req);

  const postSlug = decodeURIComponent(req.params.postSlug);
  const post = await prisma.post.findUnique({ where: { slug: postSlug } });

  if (!post) {
    throw new CustomError(404, "Post not found.");
  }

  await prisma.comment.create({
    data: {
      text: req.body.text,
      userId: req.user.id,
      postId: post.id,
      updatedAt: new Date(),
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
  getComments,
  createComment,
  editComment,
  deleteComment,
};
