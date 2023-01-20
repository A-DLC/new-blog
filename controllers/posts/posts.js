const Post = require("../../model/post/Post");
const User = require("../../model/user/User");
const appErr = require("../../utils/appErr");

//create post
const createPostCtrl = async (req, res, next) => {
  const { title, description, category, user, image } = req.body;

  try {
    if (!title || !description || !category || !req.file) {
      return res.render("posts/addPost", { error: "All fields are required." });
    }
    1;
    //Find the user
    const userID = req.session.userAuth;
    const userFound = await User.findById(userID);

    //create the post
    const postCreated = await Post.create({
      title,
      description,
      category,
      user: userFound,
      image: req.file.path,
    });

    //Push the post created into the array of user's posts
    userFound.posts.push(postCreated._id);

    //re save the user
    await userFound.save();

    res.redirect("/");
  } catch (error) {
    return res.render("posts/addPost", { error: error.message });
  }
};

//fetch all post
const fetchAllPostCtrl = async (req, res, next) => {
  try {
    const post = await Post.find().populate("comment").populate("user");
    res.json({
      status: "success",
      user: post,
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

//details
const fetchPostCtrl = async (req, res, next) => {
  try {
    //get the id from params
    const id = req.params.id;

    //find the post
    const post = await Post.findById(id)
      .populate({
        path: "comments",
        populate: {
          path: "user",
        }, //this is populate nesting
      })
      .populate("user");

    res.render("posts/postDetails", {
      post,
      error: "",
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

//delete post
const deletePostCtrl = async (req, res, next) => {
  try {
    //find the post
    const post = await Post.findById(req.params.id);
    console.log(post.user.toString());

    //Compare the id to see if the post belongs to this user
    if (post.user.toString() != req.session.userAuth.toString()) {
      return res.render("posts/postDetails", {
        post,
        error: "You are not authorized to do this action.",
      });
    }

    //delete
    await Post.findByIdAndDelete(req.params.id);

    res.redirect("/");
  } catch (error) {
    return res.render("posts/postDetails", {
      error: "You are not authorized to do this action.",
      post: "",
    });
  }
};

//update post
const updatePostCtrl = async (req, res, next) => {
  const { title, description, category } = req.body;

  try {
    //find the post
    const post = await Post.findById(req.params.id);

    //Compare the id
    if (post.user.toString() != req.session.userAuth.toString()) {
      return res.render("posts/updatePost", {
        post: "",
        error: "You are not authorized to update this post.",
      });
    }

    //check if user is updating the image
    if (req.file) {
      //update
      await Post.findByIdAndUpdate(
        req.params.id,
        {
          title,
          description,
          category,
          image: req.file.path,
        },
        {
          new: true,
        }
      );
    } else {
      //if not, update everything but the image.
      //update
      await Post.findByIdAndUpdate(
        req.params.id,
        {
          title,
          description,
          category,
        },
        {
          new: true,
        }
      );
    }

    res.redirect("/");
  } catch (error) {
    return res.render("posts/updatePost", {
      post: "",
      error: error.message,
    });
  }
};

module.exports = {
  createPostCtrl,
  fetchAllPostCtrl,
  fetchPostCtrl,
  deletePostCtrl,
  updatePostCtrl,
};
