const express = require("express");
const {
  createPostCtrl,
  fetchAllPostCtrl,
  fetchPostCtrl,
  deletePostCtrl,
  updatePostCtrl,
} = require("../../controllers/posts/posts");
const protected = require("../../middlewares/protected");
const multer = require("multer");
const storage = require("../../config/cloudinary");
const Post = require("../../model/post/Post");

const postRoutes = express.Router();

//instance of multer
const upload = multer({
  storage,
});

//FORMS
postRoutes.get("/get-post-form", (req, res) => {
  res.render("posts/addPost", { error: "" });
});

//Have the post information
postRoutes.get("/get-form-update/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.render("posts/updatePost", { post, error: "" });
  } catch (error) {
    res.render("posts/updatePost", { error, post: "" });
  }
});

//POST
postRoutes.post("/", protected, upload.single("file"), createPostCtrl);

//GET
postRoutes.get("/", fetchAllPostCtrl);

//GET/:id
postRoutes.get("/:id", fetchPostCtrl);

//DELETE/:id
postRoutes.delete("/:id", protected, deletePostCtrl);

//PUT/:id
postRoutes.put("/:id", protected, upload.single("file"), updatePostCtrl);

module.exports = postRoutes;
