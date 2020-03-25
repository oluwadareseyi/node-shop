const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    path: "/admin/add-product",
    pageTitle: "Add Product",
    editing: false
  });
};

exports.postAddproduct = async (req, res, next) => {
  const { title, imageUrl, price, description } = req.body;
  try {
    await new Product({
      title,
      price,
      description,
      imageUrl,
      userId: req.user
    }).save();
    res.redirect("/admin/products");
  } catch (err) {
    console.log(err);
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
    product: product
  });
};

exports.postEditProduct = async (req, res, next) => {
  const { productId, title, imageUrl, price, description } = req.body;
  try {
    const product = await Product.findById(productId);

    if (product.userId.toString() !== req.user._id.toString()) {
      return res.redirect("/");
    }
    product.title = title;
    product.imageUrl = imageUrl;
    product.price = price;
    product.description = description;
    await product.save();
    res.redirect("/admin/products");
  } catch (err) {
    console.log(err);
  }
};

exports.postDeleteProduct = async (req, res, next) => {
  const { productId } = req.body;
  try {
    await Product.deleteOne({ _id: productId, userId: req.user._id });
    console.log("DELETED PRODUCT");
    res.redirect("/admin/products");
  } catch (err) {
    console.log(err);
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
    console.log(err);
  }
};
