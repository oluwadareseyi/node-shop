const express = require("express");
const adminController = require("../controllers/admin");
const isAuth = require("../middleware/is-auth");
const { check, body } = require("express-validator");

const router = express.Router();

router.get("/products", isAuth, adminController.getAdminProducts);

router.get("/add-product", isAuth, adminController.getAddProduct);

router.post(
  "/add-product",
  isAuth,
  [
    body("title", "Title field cannot be empty")
      .isString()
      .isLength({ min: 1 })
      .trim(),
    body("price", "Please enter a valid price").isFloat(),
    body("description", "This description must contain at least 5 characters")
      .isLength({ min: 5 })
      .trim()
  ],
  adminController.postAddproduct
);

router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

router.post(
  "/edit-product/",
  isAuth,
  [
    body("title", "Title field cannot be empty")
      .isString()
      .isLength({ min: 1 })
      .trim(),
    body("price", "Please enter a valid price").isFloat(),
    body("description", "This description must contain at least 5 characters")
      .isLength({ min: 5 })
      .trim()
  ],
  adminController.postEditProduct
);

router.post("/delete-product/", isAuth, adminController.postDeleteProduct);
module.exports = router;
