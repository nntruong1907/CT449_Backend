const express = require("express");
const users = require("../controllers/user.controller");
const auth = require("../middlewares/auth");
const uploadCloud = require("../middlewares/uploader.js");

const router = express.Router();

router.route("/")
  .get(auth.verifyAdmin, users.findAll)

router.route("/logout")
  .post(users.logOut)

router.route("/:id")
  .get(auth.verifyAdmin, users.findOne)
  .put(auth.verifyAdminAndUser, uploadCloud.single('avatar'), users.update)
  .delete(auth.verifyAdminAndUser, users.delete)
  
module.exports = router;
