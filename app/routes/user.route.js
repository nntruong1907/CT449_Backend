const express = require("express");
const users = require("../controllers/user.controller");
const auth = require("../middlewares/auth");
const uploadCloud = require("../middlewares/uploader.js");

const router = express.Router();

router.route("/signup")
  .post(users.signup)

router.route("/login")
  .post(users.login)

router.route("/refresh")
  .post(users.refreshToken)

router.route("/")
  .get(auth.verifyToken, auth.verifyAdmin, users.findAll)

router.route("/logout")
  .post(auth.verifyToken, users.logOut)

router.route("/:id")
  .get(auth.verifyToken, users.findOne)
  .put(auth.verifyToken, auth.verifyAdminAndUser, uploadCloud.single('avatar'), users.update)
  .delete(auth.verifyToken, auth.verifyAdminAndUser, users.delete)

module.exports = router;
