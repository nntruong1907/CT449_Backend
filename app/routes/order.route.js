const express = require("express");
const orders = require("../controllers/order.controller");

const router = express.Router();

router.route("/")
  .post(orders.create)
  .get(orders.findAll)
  .delete(orders.deleteAll);

router.route("/:id")
  .put(orders.update)

module.exports = router;