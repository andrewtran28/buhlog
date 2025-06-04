const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const asyncHandler = require("express-async-handler");
const CustomError = require("../utils/customError");
const { handleValidationErrors } = require("../utils/validator");
const { generateUniqueSlug } = require("../utils/slugify");
const DOMPurify = require("isomorphic-dompurify");
const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const cheerio = require("cheerio");

const s3 = new S3Client({
  region: process.env.BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});

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

const getPostBySlug = asyncHandler(async (req, res) => {
  const slug = req.params.postSlug;
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      comments: true,
      user: { select: { username: true } },
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

  const sanitizedContent = DOMPurify.sanitize(cleanHtmlContent(req.body.content));
  const slug = await generateUniqueSlug(req.body.title);
  const createdPost = await prisma.post.create({
    data: {
      title: req.body.title,
      slug,
      content: sanitizedContent,
      published: Boolean(req.body.published).valueOf(),
      userId: user.id,
      updatedAt: new Date(),
    },
  });

  res.status(200).json({ message: "Post created.", post: createdPost });
});

const deletePost = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user.isAuthor) {
    throw new CustomError(403, "User role must be Author to perform this action.");
  }

  const post = await prisma.post.findUnique({
    where: { id: parseInt(req.params.postId) },
  });

  if (!post) {
    throw new CustomError(404, "Post not found.");
  }

  // Extract image URLs from post content, cheerio is used to parse html
  const $ = cheerio.load(post.content || "");
  const imageUrls = $("img")
    .map((_, el) => $(el).attr("src"))
    .get();

  // Convert URLs to S3 keys and delete
  const deletePromises = imageUrls.map((url) => {
    const key = new URL(url).pathname.slice(1); // remove leading '/'
    return s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: key,
      })
    );
  });

  try {
    await Promise.all(deletePromises);
  } catch (err) {
    console.error("Error deleting images from S3:", err);
  }

  // Delete post from database
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

  const newTitle = req.body.title || post.title;
  let newSlug = post.slug;

  // Only generate a new slug if the title changed
  if (newTitle !== post.title) {
    newSlug = await generateUniqueSlug(newTitle, prisma);
  }

  const isPublishing = req.body.published === true && post.published === false;

  const updatedPost = await prisma.post.update({
    where: { id: postId },
    data: {
      title: newTitle,
      slug: newSlug,
      content: cleanHtmlContent(req.body.content || post.content),
      published: req.body.published === undefined ? post.published : Boolean(req.body.published),
      createdAt: isPublishing ? new Date() : post.createdAt,
    },
  });

  res.status(200).json({
    message: `Post: ${updatedPost.title} was successfully edited.`,
    post: updatedPost,
  });
});

const cleanHtmlContent = (html) => {
  const $ = cheerio.load(html);
  $("p").each(function () {
    if (!$(this).text().trim()) {
      $(this).remove();
    }
  });

  const cleaned = $.html().trim();
  return cleaned;
};

module.exports = {
  getAllPosts,
  getAllDrafts,
  getPostBySlug,
  getPostById,
  createPost,
  deletePost,
  editPost,
};
