const { body } = require("express-validator");
const { validationResult } = require("express-validator");
const CustomError = require("./customError");
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
  body("title")
    .trim()
    .notEmpty()
    .custom(async (postTitle) => {
      const post = await prisma.post.findUnique({
        where: { title: postTitle },
      });

      if (post) {
        throw new Error("Title already exists within the blog.");
      }
    })
    .isLength({ max: 50 })
    .withMessage("Title must be between 1-50 characters.")
    .bail(),
  body("content").trim().notEmpty().bail(),
];

const commentValidator = [
  body("text").trim().notEmpty().isLength({ max: 500 }).withMessage("Comment must be under 500 characters.").bail(),
];

//Helper funciton for any API route that requires validator.
const handleValidationErrors = (req) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errorMessages = result.errors.map((err) => (err.param ? `${err.msg} (${err.param})` : err.msg));
    throw new CustomError(401, `Validation failed: ${errorMessages.join(", ")}`);
  }
};

module.exports = {
  signupValidator,
  postValidator,
  commentValidator,
  handleValidationErrors,
};
