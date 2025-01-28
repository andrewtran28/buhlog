const { body } = require("express-validator");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const signupValidator = [
  body("username")
    .trim()
    .custom(async (newUser) => {
      const users = await prisma.user.findUnique({
        where: { username: newUser },
      });

      if (users) {
        throw new Error("Username already exists.");
      }
    })
    .isAlphanumeric()
    .withMessage("Username must only contain letters or numbers.")
    .bail()
    .isLength({ min: 1, max: 25 })
    .withMessage("Username must be between 1-25 characters.")
    .bail(),
  body("password").trim().isLength({ min: 6, max: 50 }).withMessage("Password must be between 6-50 characters.").bail(),
];

const postValidator = [
  body("title").trim().notEmpty().isLength({ max: 50 }).withMessage("Subject be between 1-50 characters.").bail(),
  body("content").trim().notEmpty().bail(),
];

const commentValidator = [
  body("text").trim().notEmpty().isLength({ max: 500 }).withMessage("Comment must be under 500 characters.").bail(),
];

module.exports = {
  signupValidator,
  postValidator,
  commentValidator,
};
