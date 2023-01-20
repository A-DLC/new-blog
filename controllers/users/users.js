const bcrypt = require("bcryptjs");
const appErr = require("../../utils/appErr");
const User = require("../../model/user/User");

//register
const registerControler = async (req, res, next) => {
  const { fullname, email, password } = req.body;
  console.log(req.body);
  //check if field it's empty
  if (!fullname || !email || !password) {
    return res.render("users/register.ejs", {
      error: "All fields are required",
    });
  }

  try {
    //1. check if user exist (email)
    const userFound = await User.findOne({ email });
    //throw an error
    if (userFound) {
      return res.render("users/register.ejs", {
        error: "Email already in use",
      });
    }

    //hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHashed = await bcrypt.hash(password, salt);

    //register user
    const user = await User.create({
      fullname,
      email,
      password: passwordHashed,
    });

    console.log(user);

    // res.json({
    //   status: "success",
    //   data: user,
    // });
    res.redirect("/api/v1/users/login");
  } catch (error) {
    res.json(error);
  }
};

//login
const loginCtrl = async (req, res, next) => {
  const { email, password } = req.body;

  if ((!email, !password)) {
    return res.render("users/login.ejs", {
      error: "All fields are required",
    });
  }

  try {
    //check if email exist
    const userFound = await User.findOne({ email });
    //throw an error
    if (!userFound) {
      return res.render("users/login.ejs", {
        error: "Invalid login credentials",
      });
    }

    //verify bcrypt password
    const isPasswordValid = await bcrypt.compare(password, userFound.password);

    //error if not valid
    if (!isPasswordValid) {
      if (userFound) {
        return res.render("users/login.ejs", {
          error: "Invalid login credentials",
        });
      }
    }

    //save the user into session
    req.session.userAuth = userFound._id;

    res.redirect("/api/v1/users/profile-page");
  } catch (error) {
    return res.render("users/uploadProfilePhoto.ejs", {
      error: "Please provide an image",
    });
  }
};

//details
const userDetailsCtrl = async (req, res) => {
  try {
    //get user Id from params
    const userID = req.params.id;
    //find the user
    const user = await User.findById(userID);

    res.render("users/updateUser.ejs", {
      user,
      error: "",
    });
  } catch (error) {
    return res.render("users/uploadProfilePhoto.ejs", {
      error: error.message,
    });
  }
};

//profile
const profileCtrl = async (req, res, next) => {
  try {
    //get the login user
    const userID = req.session.userAuth;
    //find the user
    const user = await User.findById(userID)
      .populate("posts")
      .populate("comments");
    console.log(user);
    res.render("users/profile.ejs", { user });
  } catch (error) {
    return res.render("users/uploadProfilePhoto.ejs", {
      error: "Please provide an image",
    });
  }
};

//upload profile photo
const uploadProfilePhotoCtrl = async (req, res, next) => {
  // console.log(req.file.path);
  try {
    //check if file exist
    if (!req.file) {
      return res.render("users/uploadProfilePhoto.ejs", {
        error: "Please provide an image",
      });
    }
    //find the user to be updated
    const userID = req.session.userAuth;
    const userFound = await User.findById(userID);
    const user = userFound;
    //check if user is found
    if (!userFound) {
      return res.render("/", {
        error: "User not found",
      });
    }
    //Update profile photo
    await User.findByIdAndUpdate(
      userID,
      {
        profileImage: req.file.path,
      },
      {
        new: true,
      }
    );
    //redirect
    res.redirect("/api/v1/users/profile-page");
  } catch (error) {
    return res.render("users/uploadProfilePhoto.ejs", {
      error: error.message,
    });
  }
};

//upload cover img
const uploadCoverPhotoCtrl = async (req, res) => {
  try {
    //check if file exist
    if (!req.file) {
      return res.render("users/uploadProfilePhoto.ejs", {
        error: "Please upload an image",
      });
    }
    //1. Find the user to be updated
    const userId = req.session.userAuth;
    const userFound = await User.findById(userId);
    //2. check if user is found
    if (!userFound) {
      return res.render("users/uploadProfilePhoto.ejs", {
        error: "User not found",
      });
    }
    //5.Update profile photo
    const userUpdated = await User.findByIdAndUpdate(
      userId,
      {
        coverImage: req.file.path,
      },
      {
        new: true,
      }
    );
    //redirect
    res.redirect("/api/v1/users/profile-page");
  } catch (error) {
    return res.render("users/uploadProfilePhoto.ejs", {
      error: error.message,
    });
  }
};

//update password
const passUpdateCtrl = async (req, res, next) => {
  const { password } = req.body;
  try {
    //check if user is updating the password
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const passwordHashed = await bcrypt.hash(password, salt);

      //update user
      await User.findByIdAndUpdate(
        req.session.userAuth,
        {
          password: passwordHashed,
        },
        {
          new: true,
        }
      );
    }
    res.redirect("/api/v1/users/profile-page");
  } catch (error) {
    return res.render("users/uploadProfilePhoto.ejs", {
      error: error.message,
    });
  }
};

//update user
const updateUserCtrl = async (req, res) => {
  const { fullname, email, password } = req.body;

  try {
    //check the info
    if (fullname == "" || email == "") {
      return res.render("users/updateUser.ejs", {
        error: "All fields are required",
        user: "",
      });
    }
    //check if email is not taken
    if (email) {
      const emailTaken = await User.findOne({ email });
      if (emailTaken) {
        return res.render("users/updateUser.ejs", {
          error: "Email is taken.",
          user: "",
        });
      }
    }

    //update the user
    await User.findByIdAndUpdate(
      req.session.userAuth,
      {
        fullname,
        email,
      },
      {
        new: true,
      }
    );

    res.redirect("/api/v1/users/profile-page");
  } catch (error) {
    return res.render("users/updateUser.ejs", {
      error: error.message,
      user: "",
    });
  }
};

//logout
const logoutCtrl = async (req, res) => {
  //destroy the user session
  req.session.destroy(() => {
    res.redirect("/api/v1/users/login");
  });
};

//export
module.exports = {
  registerControler,
  loginCtrl,
  userDetailsCtrl,
  profileCtrl,
  uploadProfilePhotoCtrl,
  uploadCoverPhotoCtrl,
  passUpdateCtrl,
  updateUserCtrl,
  logoutCtrl,
};
