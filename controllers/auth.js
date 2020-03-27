const crypto = require("crypto");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const { sendGridKey } = require("../util/keys");

const User = require("../models/user");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: sendGridKey
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
    errorMessage: message,
    oldInput: { email: "" },
    validationErrors: []
  });
};

exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      errorMessage: errors.array()[0].msg,
      oldInput: { email, password },
      validationErrors: errors.array()
    });
  }
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(422).render("auth/login", {
        path: "/login",
        pageTitle: "Login",
        errorMessage: "Invalid email",
        oldInput: { email, password },
        validationErrors: [{ param: "email" }]
      });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(422).render("auth/login", {
        path: "/login",
        pageTitle: "Login",
        errorMessage: "Invalid password",
        oldInput: { email, password },
        validationErrors: [{ param: "password" }]
      });
    }
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
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: message,
    oldInput: { email: "" },
    validationErrors: []
  });
};

exports.postSignup = async (req, res, next) => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      // console.log(errors.array());
      return res.status(422).render("auth/signup", {
        path: "/signup",
        pageTitle: "Signup",
        errorMessage: errors.array()[0].msg,
        oldInput: { email, password },
        validationErrors: errors.array()
      });
    }
    // const existingUser = await User.findOne({ email: email });
    // if (existingUser) {
    //   await req.flash(
    //     "error",
    //     "Email already exists, please sign in or use another"
    //   );
    //   return res.redirect("/signup");
    // }

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
      <p>Click this <a href="http://localhost:4000/reset/${token}">link</a> to set a new password</p>
      `
    });
  });
};

exports.getNewPassword = async (req, res, next) => {
  const token = req.params.token;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() }
    });

    let message = req.flash("error");
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }
    res.render("auth/new-password", {
      path: "/new-password",
      pageTitle: "Reset Password",
      errorMessage: message,
      userId: user._id.toString(),
      passwordToken: token
    });
  } catch (err) {
    console.log(err);
  }
};

exports.postNewPassword = async (req, res, next) => {
  const { password, passwordToken, userId } = req.body;
  try {
    const user = await User.findById({
      _id: userId,
      resetToken: passwordToken,
      resetTokenExpiration: { $gt: Date.now() }
    });

    const hashPass = await bcrypt.hash(password, 12);

    user.password = hashPass;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();
    res.redirect("/login");
  } catch (err) {
    console.log(err);
  }
};
