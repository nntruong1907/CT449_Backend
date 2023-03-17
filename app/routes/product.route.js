const express = require("express");
const products = require("../controllers/product.controller");
const uploadCloud =require("../middlewares/uploader");
const router = express.Router();

router.route("/")
  .post(uploadCloud.single('image_path'), products.create)
  .get(products.findAll)

router.route("/:id")
  .get(products.findOne)
  .put(uploadCloud.single('image_path'), products.update)
  .delete(products.delete);

module.exports = router;
