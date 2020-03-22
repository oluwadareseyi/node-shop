const Product = require("../models/product");
const Order = require("../models/order");

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.render("shop/product-list", {
      prods: products,
      path: "/products",
      pageTitle: "Products",
      isAuthenticated: req.session.isLoggedIn
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getProduct = async (req, res, next) => {
  const prodId = req.params.productId;
  try {
    const product = await Product.findById(prodId);
    res.render("shop/product-detail", {
      product: product,
      path: "/products",
      pageTitle: product.title,
      isAuthenticated: req.session.isLoggedIn
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getIndex = async (req, res, next) => {
  try {
    const products = await Product.find();

    res.render("shop/index", {
      prods: products,
      path: "/",
      pageTitle: "Shop",
      isAuthenticated: req.session.isLoggedIn
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getCart = async (req, res, next) => {
  try {
    const user = await req.user
      .populate("cart.items.productId", "-userId")
      .execPopulate();
    const products = user.cart.items;

    res.render("shop/cart", {
      products: products,
      path: "/cart",
      pageTitle: "Your Cart",
      isAuthenticated: req.session.isLoggedIn
    });
  } catch (err) {
    console.log(err);
  }
};

exports.postCart = async (req, res, next) => {
  const { productId } = req.body;
  const product = await Product.findById(productId);
  await req.user.addToCart(product);
  res.redirect("/cart");
};

exports.deleteCart = async (req, res, next) => {
  const { productId } = req.body;
  try {
    await req.user.removeFromCart(productId);
    res.redirect("/cart");
  } catch (err) {
    console.log(err);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ "user.userId": req.user._id });

    res.render("shop/orders", {
      path: "/orders",
      pageTitle: "Your Orders",
      orders: orders,
      isAuthenticated: req.session.isLoggedIn
    });
  } catch (err) {
    console.log(err);
  }
};

exports.postOrders = async (req, res, next) => {
  const user = await req.user
    .populate("cart.items.productId", "-userId")
    .execPopulate();

  const products = user.cart.items.map(item => {
    return { quantity: item.quantity, product: { ...item.productId._doc } };
  });

  const order = new Order({
    user: {
      name: req.user.name,
      userId: req.user
    },
    products: products
  });
  try {
    await order.save();
    await req.user.clearCart();
    res.redirect("/orders");
  } catch (err) {
    console.log(err);
  }
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    path: "/checkout",
    pageTitle: "Your Cart",
    isAuthenticated: req.session.isLoggedIn
  });
};
