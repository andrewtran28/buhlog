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
  body("firstName")
    .trim()
    .notEmpty()
    .matches(/^[a-zA-Z ]*$/)
    .withMessage("Name should only contain letters.")
    .bail()
    .isLength({ max: 25 })
    .bail(),
  body("lastName")
    .trim()
    .matches(/^[a-zA-Z ]*$/)
    .withMessage("Name should only contain letters.")
    .isLength({ max: 25 })
    .bail(),
  body("password").trim().isLength({ min: 6, max: 50 }).withMessage("Password must be between 6-50 characters.").bail(),
];

const postValidator = [
  body("title").trim().notEmpty().isLength({ max: 50 }).withMessage("Subject be between 1-50 characters.").bail(),
  body("content").trim().notEmpty().bail(),
];

module.exports = {
  signupValidator,
  postValidator,
};
