const express = require("express");
const brands = require("../controllers/brand.controller");
const auth = require("../middlewares/auth");

const router = express.Router();

router.route("/")
    .get(brands.findAll)
    .post(auth.verifyToken, auth.verifyAdmin, brands.create)

router.route("/:id")
    .get(brands.findOne)
    .put(auth.verifyToken, auth.verifyAdmin, brands.update)
    .delete(auth.verifyToken, auth.verifyAdmin, brands.delete)

module.exports = router;