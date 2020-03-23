const User = require("../models/user");
exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: req.session.isLoggedIn
  });
};

exports.postLogin = async (req, res, next) => {
  try {
    const user = await User.findById("5e6224ed1bb240387c5df891");
    req.session.user = user;
    req.session.isLoggedIn = true;
    await req.session.save();
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
};

exports.postLogout = async (req, res, next) => {
  try {
    req.session.destroy(err => {
      console.log(err);
      res.redirect("/");
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    isAuthenticated: false
  });
};

exports.postSignup = async (req, res, next) => {
  const { email, password, confirmPassword } = req.body;
  try {
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.redirect("/signup");
    }

    await new User({ email, password, cart: { items: [] } }).save();
  } catch (err) {
    console.log(err);
  }
};
