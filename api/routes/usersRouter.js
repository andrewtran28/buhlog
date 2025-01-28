const { Router } = require("express");
const usersRouter = Router();
const usersController = require("../controllers/usersController");
// const { signupValidator, } = require("../controllers/validator.js");

usersRouter.post("/", usersController.createUser);
usersRouter.delete("/", usersController.deleteUser);

module.exports = usersRouter;
