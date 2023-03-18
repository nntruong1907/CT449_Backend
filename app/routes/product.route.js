const express = require("express");
const products = require("../controllers/product.controller");
const auth = require("../middlewares/auth");
const uploadCloud =require("../middlewares/uploader");

const router = express.Router();

router.route("/")
  .post(auth.verifyTokenAdmin, uploadCloud.single('image_path'), products.create)
  .get(products.findAll)

router.route("/:id")
  .get(products.findOne)
  .put(auth.verifyTokenAdmin, uploadCloud.single('image_path'), products.update)
  .delete(auth.verifyTokenAdmin, products.delete);

module.exports = router;
