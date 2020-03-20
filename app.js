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
const helmet = require("helmet");

const app = express();

const port = 4000;

app.set("view engine", "ejs");
app.set("views", "views");
app.use(helmet());

app.use(bodyparser.urlencoded({ extended: false }));

app.use(async (req, res, next) => {
  try {
    const user = await User.findById("5e6224ed1bb240387c5df891");
    req.user = user;
    next();
  } catch (err) {
    console.log(err);
  }
});
app.use(express.static(path.join(__dirname, "public")));

app.use("/admin", adminRoutes);

app.use(userRoutes);

app.use(authRoutes);

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
