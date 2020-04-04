const Product = require("../models/product");
const Order = require("../models/order");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.render("shop/product-list", {
      prods: products,
      path: "/products",
      pageTitle: "Products"
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
      pageTitle: product.title
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
      pageTitle: "Shop"
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
      pageTitle: "Your Cart"
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
      orders: orders
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
      email: req.user.email,
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
    pageTitle: "Your Cart"
  });
};

exports.getInvoice = async (req, res, next) => {
  const orderId = req.params.orderId;

  const order = await Order.findById(orderId);

  if (!order) {
    return next(new Error("No orders Found"));
  }

  if (!order.user.userId.toString() === req.user._id.toString()) {
    return next(new Error("unauthorized"));
  }
  const invoiceName = "invoice-" + orderId + ".pdf";
  const invoicePath = path.join("data", "invoices", invoiceName);

  const pdfDoc = new PDFDocument();
  res.contentType("application/pdf");

  pdfDoc.pipe(fs.createWriteStream(invoicePath));
  pdfDoc.pipe(res);

  pdfDoc.fontSize(26).text(`Invoice ${orderId}`, {
    underline: true
  });

  pdfDoc.text("---------------------------");

  let totalPrice = 0;
  order.products.forEach(product => {
    totalPrice += product.quantity * product.product.price;
    pdfDoc
      .fontSize(14)
      .text(
        `${product.product.title} - ${product.quantity} * ${
          product.product.price
        } = ${product.quantity * product.product.price}`
      );
  });

  pdfDoc.text("---------------");

  pdfDoc.fontSize(20).text(`Total Price: ${totalPrice}`);

  pdfDoc.end();

  // const file = fs.createReadStream(invoicePath);

  // file.pipe(res);

  // fs.readFile(invoicePath, (err, data) => {
  //   if (err) {
  //     console.log(err);
  //     return next(err);
  //   }

  //   // console.log(orderId);
  // });

  // const data = fs.readFileSync(`data/invoices/${invoiceName}`);

  // res.setHeader(
  //   "Content-Disposition",
  //   'attachment: filename="' + invoiceName + '"'
  // );
  // res.contentDisposition();
  // res.send(data);
};
