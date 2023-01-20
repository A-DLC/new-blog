const express = require("express");
const multer = require("multer");
const storage = require("../../config/cloudinary");
const {
  registerControler,
  loginCtrl,
  userDetailsCtrl,
  profileCtrl,
  uploadProfilePhotoCtrl,
  uploadCoverPhotoCtrl,
  passUpdateCtrl,
  updateUserCtrl,
  logoutCtrl,
} = require("../../controllers/users/users");
const protected = require("../../middlewares/protected");
const userRoutes = express.Router();

//instance of multer
const upload = multer({ storage });

//-------
//Rendering views
//------- MY CODE

//login ejs
userRoutes.get("/login", (req, res) => {
  res.render("users/login.ejs", {
    error: "",
  });
});

//register ejs
userRoutes.get("/register", (req, res) => {
  res.render("users/register.ejs", {
    error: "",
  });
});

//profile ejs
// userRoutes.get("/profile-page", (req, res) => {
//   res.render("users/profile.ejs"), { user };
// });

//upload profile photo ejs
userRoutes.get("/upload-profile-photo-form", (req, res) => {
  res.render("users/uploadProfilePhoto.ejs", { error: "" });
});

// //upload Cover photo ejs
userRoutes.get("/upload-cover-photo-form", (req, res) => {
  res.render("users/uploadCoverPhoto.ejs", { error: "" });
});

//Update Cover photo ejs. This is for testing purposes. The logic is in the controller.
// userRoutes.get("/update-user-form", (req, res) => {
//   res.render("users/updateUser.ejs", { error: "" });
// });

//update password form
userRoutes.get("/update-user-password", (req, res) => {
  res.render("users/updatePassword.ejs", { error: "" });
});

//

//-----------
//Back-end routes
//-----------
//register
userRoutes.post("/register", registerControler);

// LOGIN POST/login
userRoutes.post("/login", loginCtrl);

//PROFILE GET/profile/:id
userRoutes.get("/profile-page", protected, profileCtrl);

//PROFILE PHOTO PUT/profile-photo-upload/:id
userRoutes.put(
  "/profile-photo-upload/",
  protected,
  upload.single("profile"),
  uploadProfilePhotoCtrl
);

//PROFILE COVER PUT/cover-photo-upload/:id
userRoutes.put(
  "/cover-photo-upload/",
  protected,
  upload.single("profile"),
  uploadCoverPhotoCtrl
);

//PASSWORD PUT/update-password/:id
userRoutes.put("/update-password", passUpdateCtrl);

//USER UPDATE PUT/update/:id
userRoutes.put("/update", updateUserCtrl);
//The /:id is remove because we can use the session user ID in the controller

//LOGOUT GET/logout
userRoutes.get("/logout", logoutCtrl);

//DETAILS GET/:id. This is to get the user details before updating
userRoutes.get("/:id", userDetailsCtrl);

module.exports = userRoutes;
