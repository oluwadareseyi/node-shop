const crypto = require("crypto");

const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

const User = require("../models/user");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        "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"
    }
  })
);
exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message
  });
};

exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      req.flash("error", "Invalid email");
      return res.redirect("/login");
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      req.flash("error", "Invalid password");
      return res.redirect("/login");
    }
    req.session.user = user;
    req.session.isLoggedIn = true;
    await req.session.save();
    await res.redirect("/");
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
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: message
  });
};

exports.postSignup = async (req, res, next) => {
  const { email, password, confirmPassword } = req.body;
  try {
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      await req.flash(
        "error",
        "Email already exists, please sign in or use another"
      );
      return res.redirect("/signup");
    }

    if (password !== confirmPassword) {
      await req.flash("error", "Passwords do not match");
      return res.redirect("/signup");
    }

    const hashPass = await bcrypt.hash(password, 12);

    await new User({ email, password: hashPass, cart: { items: [] } }).save();
    res.redirect("/login");
    await transporter.sendMail({
      to: email,
      from: "no-reply@nodeshop.com",
      subject: "Sign Up Suceeded",
      html: `<h1>You Succesfully signed up!</h1>`
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getReset = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: message
  });
};

exports.postReset = async (req, res, next) => {
  const { email } = req.body;
  crypto.randomBytes(32, async (err, buffer) => {
    if (err) {
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    const user = await User.findOne({ email });
    if (!user) {
      req.flash("error", "No account with that email");
      return res.redirect("/reset");
    }
    user.resetToken = token;
    user.resetTokenExpiration = Date.now() + 3600000;
    await user.save();
    res.redirect("/");
    await transporter.sendMail({
      to: email,
      from: "no-reply@nodeshop.com",
      subject: "Password reset",
      html: `
      <p>You requested a password reset</p>
      <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password</p>
      `
    });
  });
};
