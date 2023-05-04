const express = require("express");
const orders = require("../controllers/order.controller");
const auth = require("../middlewares/auth");

const router = express.Router();

router.route("/")
  .get(orders.findAll)
  .post(auth.verifyToken, orders.create)

router.route("/:id")
  .get(orders.findOne)
  .put(auth.verifyToken, orders.update)
  .delete(auth.verifyToken, auth.verifyAdmin, orders.delete);

router.route("/findByUserId/:id")
  .get(orders.findByUserId);

module.exports = router;