const postsController = require("../controllers/postsController");
const { Router } = require("express");
const postsRouter = Router();
const { postValidator } = require("../utils/validator");

postsRouter.get("/", postsController.getAllPosts);

postsRouter.post("/", postValidator, postsController.createPost);
postsRouter.get("/:postTitle", postsController.getPostByTitle);
postsRouter.put("/:postId", postValidator, postsController.editPost);
postsRouter.delete("/:postId", postsController.deletePost);

postsRouter.get("/:postTitle/comments", postsController.getComments);
postsRouter.post("/:postTitle/comments", postsControllers.createComment);
postsRouter.post("/:postTitle/comments", postsControllers.editComment);
postsRouter.delete("/:postTitle/comments", postsControllers.deleteComment);

module.exports = postsRouter;
