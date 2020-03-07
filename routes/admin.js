const express = require("express");
const path = require("path");
const adminController = require("../controllers/admin");

// const rootDir = require("../util/path");

const router = express.Router();

router.get("/products", adminController.getAdminProducts);

router.get("/add-product", adminController.getAddProduct);
router.post("/add-product", adminController.postAddproduct);

router.get("/edit-product/:productId", adminController.getEditProduct);

router.post("/edit-product/", adminController.postEditProduct);

router.post("/delete-product/", adminController.postDeleteProduct);
module.exports = router;
