const { Router } = require("express");
const multer = require("multer");
const { parse } = require("url");
const path = require("path");
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
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

imageRouter.post(
  "/",
  authenticateToken,
  upload.single("image"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded or file larger than 3MB." });
    }

    const imageExt = req.file.originalname.split(".").pop();
    const imageName = `${uuidv4()}.${imageExt}`;

    //AWS S3 params
    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: `uploads/${imageName}`,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    try {
      await s3.send(new PutObjectCommand(params));
      const imageUrl = `https://${process.env.BUCKET_NAME}.s3.${process.env.BUCKET_REGION}.amazonaws.com/uploads/${imageName}`;
      res.status(200).json({ imageUrl });
    } catch (err) {
      console.error("Error uploading image:", err);
      res.status(500).json({ message: "An error occurred while uploading the image." });
    }
  })
);

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

module.exports = imageRouter;
