const { S3Client, ListObjectsV2Command, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { PrismaClient } = require("@prisma/client");
const { parse } = require("url");
const { JSDOM } = require("jsdom"); // <-- import jsdom

const s3 = new S3Client({
  region: process.env.BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});

const prisma = new PrismaClient();
const BUCKET_NAME = process.env.BUCKET_NAME;

(async () => {
  try {
    // Step 1: Get all post content
    const posts = await prisma.post.findMany({ select: { content: true } });

    const usedImageKeys = new Set();

    for (const post of posts) {
      const dom = new JSDOM(post.content); // <-- use jsdom here
      const imgs = dom.window.document.querySelectorAll("img");
      imgs.forEach((img) => {
        const src = img.getAttribute("src");
        if (src && src.includes(BUCKET_NAME)) {
          const key = parse(src).pathname.slice(1); // remove leading '/'
          usedImageKeys.add(key);
        }
      });
    }

    // Step 2: List all objects in "uploads/"
    const listed = await s3.send(
      new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: "uploads/",
      })
    );

    const unusedRootKeys = [];

    for (const obj of listed.Contents || []) {
      const key = obj.Key;

      // Skip images already in folders (e.g., uploads/30/image.jpg)
      if (key.split("/").length > 2) continue;

      if (!usedImageKeys.has(key)) {
        unusedRootKeys.push(key);
      }
    }

    // Step 3: Delete unused root images
    for (const key of unusedRootKeys) {
      console.log("Deleting unused image:", key);
      await s3.send(
        new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
        })
      );
    }

    console.log(`✅ Cleaned up ${unusedRootKeys.length} unused images.`);
  } catch (err) {
    console.error("Error during cleanup:", err);
  } finally {
    await prisma.$disconnect();
  }
})();
