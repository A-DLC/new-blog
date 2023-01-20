const Comment = require("../../model/comment/Comment");
const Post = require("../../model/post/Post");
const User = require("../../model/user/User");
const appErr = require("../../utils/appErr");

//Create Comment
const createCommentCtrl = async (req, res, next) => {
  const { message } = req.body;
  try {
    //find the post
    const post = await Post.findById(req.params.id);

    //create the comment
    const comment = await Comment.create({
      user: req.session.userAuth,
      message,
      post: post._id,
    });

    //Push the comment
    post.comments.push(comment._id);
    //find the user
    const user = await User.findById(req.session.userAuth);
    //push the comment into
    user.comments.push(comment._id);

    //dissable validation
    //save
    await post.save({ validateBeforeSave: false });
    await user.save({ validateBeforeSave: false });

    //redirecy to a single page
    res.redirect(`/api/v1/posts/${post?._id}`);
  } catch (error) {
    next(appErr(error.message));
  }
};

//comment details (for updating)
const commentDetailsCtrl = async (req, res, next) => {
  try {
    //get the id from params
    const id = req.params.id;

    //find the post
    const comment = await Comment.findById(id);

    res.render("comments/updateComment", {
      comment,
      error: "",
    });
  } catch (error) {
    res.render("comments/updateComment", {
      error: error.message,
    });
  }
};

//comment delete
const deleteCommentCtrl = async (req, res, next) => {
  console.log(req.query.postId);
  try {
    //find the comment
    const comment = await Comment.findById(req.params.id);

    //Compare the id
    if (comment.user.toString() != req.session.userAuth.toString()) {
      return next(appErr("You are not allowed to delete this comment", 403));
    }

    //delete
    await Comment.findByIdAndDelete(req.params.id);

    res.redirect(`/api/v1/posts/${req.query.postId}`);
  } catch (error) {
    next(appErr(error.message));
  }
};

//comment update
const updateCommentCtrl = async (req, res, next) => {
  try {
    //find the comment
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      next(appErr("Comment not found"));
    }

    //Compare the id
    if (comment.user.toString() != req.session.userAuth.toString()) {
      return next(appErr("You are not allowed to update this comment", 403));
    }

    //update
    const commentUpdated = await Comment.findByIdAndUpdate(
      req.params.id,
      {
        message: req.body.message,
      },
      {
        new: true,
      }
    );

    //redirect
    res.redirect(`/api/v1/posts/${req.query.postId}`);
  } catch (error) {
    next(appErr(error.message));
  }
};

module.exports = {
  createCommentCtrl,
  commentDetailsCtrl,
  deleteCommentCtrl,
  updateCommentCtrl,
};
