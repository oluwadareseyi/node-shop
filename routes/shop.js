const express = require("express");

const shopController = require("../controllers/shop");

const routes = express.Router();

routes.get("/", shopController.getIndex);
routes.get("/products", shopController.getProducts);
routes.get("/products/:productId", shopController.getProduct);
routes.get("/cart", shopController.getCart);
routes.post("/cart", shopController.postCart);
routes.post("/create-order", shopController.postOrders);
routes.post("/cart-delete-item", shopController.deleteCart);
routes.get("/orders", shopController.getOrders);
// routes.get("/checkout", shopController.getCheckout);

module.exports = routes;
