const postsController = require("../controllers/postsController");
const commentsController = require("../controllers/commentsController");
const { Router } = require("express");
const postsRouter = Router();
const { authenticateToken } = require("../utils/auth");
const { postValidator, commentValidator } = require("../utils/validator");

postsRouter.get("/", postsController.getAllPosts);
postsRouter.get("/drafts", authenticateToken, postsController.getAllDrafts);

postsRouter.get("/:postSlug", postsController.getPostBySlug);
postsRouter.post("/", authenticateToken, postValidator, postsController.createPost);
postsRouter.get("/:postId/edit", postsController.getPostById);
postsRouter.put("/:postId", authenticateToken, postValidator, postsController.editPost);
postsRouter.delete("/:postId", authenticateToken, postsController.deletePost);

postsRouter.get("/:postSlug/comments", commentsController.getComments);
postsRouter.post("/:postSlug/comments", authenticateToken, commentValidator, commentsController.createComment);
postsRouter.put("/:postSlug/comments/:commentId", authenticateToken, commentValidator, commentsController.editComment);
postsRouter.delete("/:postSlug/comments/:commentId", authenticateToken, commentsController.deleteComment);

module.exports = postsRouter;
