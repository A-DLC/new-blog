require("dotenv").config();
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const methodOverride = require("method-override");

const globalErrHandler = require("./middlewares/globalHandler");
const commentsRoutes = require("./routes/comments/comments");
const postRoutes = require("./routes/posts/posts");
const userRoutes = require("./routes/users/users");
const Post = require("./model/post/Post");
const { truncatePost } = require("./utils/helpers");
require("./config/dbConnect");

const app = express();

//helpers  / Everything that we add to the locals we are goin to have it on the templates.
app.locals.truncatePost = truncatePost;

//middlewares
//---------

//configure ejs
app.set("view engine", "ejs");

//serve static files
app.use(express.static(__dirname, +"/public"));

app.use(express.json()); //parse incoming data
app.use(express.urlencoded({ extended: true })); // pass form data

//Method override
app.use(methodOverride("_method"));

//session config
app.use(
  session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({
      mongoUrl: process.env.MONGO_URL,
      ttl: 24 * 60 * 60, //1 day
    }),
  })
);

//save the login user into locals
app.use((req, res, next) => {
  if (req.session.userAuth) {
    res.locals.userAuth = req.session.userAuth;
  } else {
    res.locals.userAuth = null;
  }
  next();
});

//render home page.
app.get("/", async (req, res) => {
  try {
    const posts = await Post.find().populate("user");
    res.render("index.ejs", { posts });
  } catch (error) {
    res.render("index", { error: error.message });
  }
});

//routes
//---------

//---------
//users route
//---------
app.use("/api/v1/users", userRoutes);

//---------
//posts route
//---------

app.use("/api/v1/posts", postRoutes);

//---------
//comments route
//---------

app.use("/api/v1/comments", commentsRoutes);

//error handler middlewares
app.use(globalErrHandler);

//listen server
const PORT = process.env.PORT || 9000;
app.listen(PORT, console.log(`Server it's running on PORT ${PORT}`));
