const express = require("express");
const users = require("../controllers/user.controller");
const auth = require("../middlewares/auth");
const uploadCloud = require("../middlewares/uploader.js");

const router = express.Router();

router.route("/")
  .get(auth.verifyTokenAdmin, users.findAll)

router.route("/logout")
  .post(users.logOut)

router.route("/:id")
  .get(auth.verifyTokenAdmin, users.findOne)
  .delete(auth.verifyTokenAdmin, users.delete)
  .put(auth.verifyTokenAdmin, uploadCloud.single('avatar'), users.update)
  
module.exports = router;
