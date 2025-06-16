const { Router } = require("express");
const multer = require("multer");
const { parse } = require("url");
const path = require("path");
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");
const { authenticateToken } = require("../utils/auth");
const asyncHandler = require("express-async-handler");

const imageRouter = Router();

const s3 = new S3Client({
  region: process.env.BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"), false);
    }
    cb(null, true);
  },
});

// Upload image
imageRouter.post(
  "/",
  authenticateToken,
  upload.single("image"),
  asyncHandler(async (req, res) => {
    const postId = req.body.postId;
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded or file larger than 3MB." });
    }

    if (!postId) {
      return res.status(400).json({ message: "Missing postId for image upload." });
    }

    const imageExt = req.file.originalname.split(".").pop();
    const imageName = `${uuidv4()}.${imageExt}`;

    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: `uploads/${postId}/${imageName}`,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    try {
      await s3.send(new PutObjectCommand(params));
      const imageUrl = `https://${process.env.BUCKET_NAME}.s3.${process.env.BUCKET_REGION}.amazonaws.com/uploads/${postId}/${imageName}`;
      res.status(200).json({ imageUrl });
    } catch (err) {
      console.error("Error uploading image:", err);
      res.status(500).json({ message: "An error occurred while uploading the image." });
    }
  })
);

// Delete single image by URL
imageRouter.delete(
  "/",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { imageUrl } = req.body;
    if (!imageUrl) return res.status(400).json({ message: "Image URL required" });

    const parsed = parse(imageUrl);
    const key = parsed.pathname.startsWith("/") ? parsed.pathname.slice(1) : parsed.pathname;

    try {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: process.env.BUCKET_NAME,
          Key: key,
        })
      );
      res.status(200).json({ message: "Image deleted" });
    } catch (err) {
      console.error("Error deleting image:", err);
      res.status(500).json({ message: "Failed to delete image" });
    }
  })
);

// Delete all unused images for a post
imageRouter.delete(
  "/unused",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { postId, html } = req.body;

    if (!postId || !html) {
      return res.status(400).json({ message: "postId and HTML content required." });
    }

    // Step 1: Extract used image URLs from HTML
    const usedUrls = new Set();
    const imgRegex = /<img[^>]+src="([^">]+)"/g;
    let match;
    while ((match = imgRegex.exec(html))) {
      usedUrls.add(match[1]);
    }

    // Step 2: List all images in the post's S3 folder
    const prefix = `uploads/${postId}/`;
    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.BUCKET_NAME,
      Prefix: prefix,
    });

    const listResponse = await s3.send(listCommand);
    const objectsToDelete = [];

    for (const item of listResponse.Contents || []) {
      const fullUrl = `https://${process.env.BUCKET_NAME}.s3.${process.env.BUCKET_REGION}.amazonaws.com/${item.Key}`;
      if (!usedUrls.has(fullUrl)) {
        objectsToDelete.push({ Key: item.Key });
      }
    }

    // Step 3: Delete unused images
    if (objectsToDelete.length > 0) {
      await s3.send(
        new DeleteObjectsCommand({
          Bucket: process.env.BUCKET_NAME,
          Delete: {
            Objects: objectsToDelete,
          },
        })
      );
    }

    res.status(200).json({
      message: `Deleted ${objectsToDelete.length} unused image(s).`,
    });
  })
);

module.exports = imageRouter;
