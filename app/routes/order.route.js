const express = require("express");
const orders = require("../controllers/order.controller");
const auth = require("../middlewares/auth");

const router = express.Router();

router.route("/")
  .post(orders.create)
  .get(orders.findAll)

router.route("/:id")
  .get(orders.findOne)
  .put(auth.verifyTokenAdmin, orders.update)
  .delete(orders.delete);

module.exports = router;