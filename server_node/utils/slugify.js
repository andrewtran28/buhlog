const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const slugify = (title) => {
  // Sanitize and remove unwanted characters from post title to create a URL friendly slug
  let baseSlug = title
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[\s_-]+/g, "-");

  // If baseSlug is empty, generate a random slug
  if (!baseSlug) {
    baseSlug = `post-${Math.random().toString(36).substring(2, 10)}`;
  }

  return baseSlug;
};

const generateUniqueSlug = async (title) => {
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let counter = 1;

  while (await prisma.post.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

module.exports = { generateUniqueSlug };
