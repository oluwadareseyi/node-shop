const express = require("express");
const bodyparser = require("body-parser");
const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const path = require("path");
const notFound = require("./controllers/error");
const mongoose = require("mongoose");
const User = require("./models/user");
const { dbKey } = require("./util/keys");
const session = require("express-session");
const mongoDBStore = require("connect-mongodb-session")(session);
// const morgan = require("morgan");
// const helmet = require("helmet");

const app = express();
const store = new mongoDBStore({
  uri: dbKey,
  collection: "sessions"
});

const port = 4000;

app.set("view engine", "ejs");
app.set("views", "views");
// app.use(helmet());
// app.use(morgan("dev"));

app.use(bodyparser.urlencoded({ extended: false }));
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store
  })
);

app.use(async (req, res, next) => {
  try {
    if (!req.session.user) {
      return next();
    }
    const user = await User.findById(req.session.user._id);
    req.user = user;
    next();
  } catch (err) {
    console.log(err);
  }
});
app.use(express.static(path.join(__dirname, "public")));

app.use(authRoutes);

app.use("/admin", adminRoutes);

app.use(userRoutes);

app.use(notFound);

mongoose
  .connect(dbKey, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    User.findOne().then(user => {
      if (!user) {
        const user = new User({
          name: "Seyi",
          email: "test@test.com",
          cart: {
            items: []
          }
        });
        user.save();
      }
    });
    console.log("DB connected!");
    app.listen(port, () => console.log(`app running on port ${port}`));
  })
  .catch(err => {
    console.log(err);
  });
