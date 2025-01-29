const postsController = require("../controllers/postsController");
const { Router } = require("express");
const postsRouter = Router();
const { authenticateToken } = require("../utils/auth");
const { postValidator, commentValidator } = require("../utils/validator");

postsRouter.get("/", postsController.getAllPosts);

postsRouter.get("/:postTitle", postsController.getPostByTitle);
postsRouter.post("/", authenticateToken, postValidator, postsController.createPost);
postsRouter.put("/:postTitle", authenticateToken, postValidator, postsController.editPost);
postsRouter.delete("/:postTitle", authenticateToken, postsController.deletePost);

postsRouter.get("/:postTitle/comments", postsController.getComments);
postsRouter.post("/:postTitle/comments", authenticateToken, commentValidator, postsController.createComment);
postsRouter.put("/:postTitle/comments/:commentId", authenticateToken, commentValidator, postsController.editComment);
postsRouter.delete("/:postTitle/comments/:commentId", authenticateToken, postsController.deleteComment);

module.exports = postsRouter;
