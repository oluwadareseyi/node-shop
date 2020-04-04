const { validationResult } = require("express-validator");
// const { Types } = require("mongoose");
const Product = require("../models/product");

const fileHelper = require("../util/file");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    path: "/admin/add-product",
    pageTitle: "Add Product",
    editing: false,
    errorMessage: "",
    oldInput: {},
    validationErrors: []
  });
};

exports.postAddproduct = async (req, res, next) => {
  const { title, price, description } = req.body;
  const image = req.file;
  // console.log(image);

  try {
    if (!image) {
      return res.status(422).render("admin/edit-product", {
        path: "/admin/add-product",
        pageTitle: "Add Product",
        editing: false,
        errorMessage: "Attached file is not an image",
        oldInput: { title, price, description },
        validationErrors: []
      });
    }

    const imageUrl = image.path;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("admin/edit-product", {
        path: "/admin/add-product",
        pageTitle: "Add Product",
        editing: false,
        errorMessage: errors.array()[0].msg,
        oldInput: { title, image, price, description },
        validationErrors: errors.array()
      });
    }
    await new Product({
      // _id: Types.ObjectId("5e624813e5dea53b04fb1a03"),
      title,
      price,
      description,
      imageUrl,
      userId: req.user
    }).save();
    res.redirect("/admin/products");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getEditProduct = async (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;

  const product = await Product.findById(prodId);

  if (!product) {
    return res.redirect("/");
  }
  res.render("admin/edit-product", {
    path: "/admin/edit-product",
    pageTitle: "Edit Product",
    editing: editMode,
    product: product,
    errorMessage: "",
    oldInput: {},
    validationErrors: []
  });
};

exports.postEditProduct = async (req, res, next) => {
  const { productId, title, price, description } = req.body;

  const image = req.file;
  try {
    const product = await Product.findById(productId);

    if (product.userId.toString() !== req.user._id.toString()) {
      return res.redirect("/");
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("admin/edit-product", {
        path: "/admin/edit-product",
        pageTitle: "Edit Product",
        editing: true,
        product: { title, price, description, _id: productId },
        errorMessage: errors.array()[0].msg,
        oldInput: {},
        validationErrors: errors.array()
      });
    }
    product.title = title;
    if (image) {
      fileHelper.deleteFile(product.imageUrl);
      product.imageUrl = image.path;
    }
    product.price = price;
    product.description = description;
    await product.save();
    res.redirect("/admin/products");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postDeleteProduct = async (req, res, next) => {
  const { productId } = req.body;
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return next(new Error("product not found"));
    }
    fileHelper.deleteFile(product.imageUrl);
    await Product.deleteOne({ _id: productId, userId: req.user._id });
    console.log("DELETED PRODUCT");
    res.redirect("/admin/products");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getAdminProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ userId: req.user._id });
    res.render("admin/products", {
      prods: products,
      path: "/admin/products",
      pageTitle: "Admin Products"
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};
