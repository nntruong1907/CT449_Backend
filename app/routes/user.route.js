const express = require("express");
const users = require("../controllers/user.controller");

const router = express.Router();

router.route("/signup")
  .post(users.create)

router.route("/login")
  .post(users.login)

router.route("/")
  .get(users.findAll)

router.route("/:id")
  .delete(users.delete)
  .put(users.update)
  
module.exports = router;
