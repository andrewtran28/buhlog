const postsController = require("../controllers/postsController");
const commentsController = require("../controllers/commentsController");
const { Router } = require("express");
const postsRouter = Router();
const { authenticateToken } = require("../utils/auth");
const { postValidator, commentValidator } = require("../utils/validator");

postsRouter.get("/", postsController.getAllPosts);
postsRouter.get("/drafts", authenticateToken, postsController.getAllDrafts);

postsRouter.get("/:postTitle", postsController.getPostByTitle);
postsRouter.post("/", authenticateToken, postValidator, postsController.createPost);
postsRouter.get("/:postId/edit", postsController.getPostById);
postsRouter.put("/:postId", authenticateToken, postValidator, postsController.editPost);
postsRouter.delete("/:postTitle", authenticateToken, postsController.deletePost);

postsRouter.get("/:postTitle/comments", commentsController.getComments);
postsRouter.post("/:postTitle/comments", authenticateToken, commentValidator, commentsController.createComment);
postsRouter.put("/:postTitle/comments/:commentId", authenticateToken, commentValidator, commentsController.editComment);
postsRouter.delete("/:postTitle/comments/:commentId", authenticateToken, commentsController.deleteComment);

module.exports = postsRouter;
