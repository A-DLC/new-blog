const express = require("express");
const {
  createCommentCtrl,
  commentDetailsCtrl,
  deleteCommentCtrl,
  updateCommentCtrl,
} = require("../../controllers/comments/comments");

const protected = require("../../middlewares/protected");
const commentsRoutes = express.Router();

//POST
commentsRoutes.post("/:id", protected, createCommentCtrl);

//GET/:id
commentsRoutes.get("/:id", commentDetailsCtrl);

//DELETE/:id
commentsRoutes.delete("/:id", protected, deleteCommentCtrl);

//PUT/:id
commentsRoutes.put("/:id", protected, updateCommentCtrl);

module.exports = commentsRoutes;
