const { Router } = require("express");
const usersRouter = Router();
const usersController = require("../controllers/usersController");
const { signupValidator } = require("../utils/validator");

//User Routing
usersRouter.get("/", usersController.getCurrentUser);
usersRouter.post("/", signupValidator, usersController.createUser);
usersRouter.delete("/", usersController.deleteUser);

//Authentication Routing
usersRouter.post("/login", usersController.logInUser);
usersRouter.post("/logout", usersController.logOutUser);

module.exports = usersRouter;
