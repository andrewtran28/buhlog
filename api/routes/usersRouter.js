const { Router } = require("express");
const usersRouter = Router();
const usersController = require("../controllers/usersController");
const { signupValidator } = require("../utils/validator");
const { authenticateToken } = require("../utils/auth");

//User Routing
usersRouter.get("/", authenticateToken, usersController.getUserInfo);
usersRouter.post("/", signupValidator, usersController.createUser);
usersRouter.delete("/", authenticateToken, usersController.deleteUser);

module.exports = usersRouter;
