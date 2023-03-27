const express = require("express");
const types = require("../controllers/type.controller");
const auth = require("../middlewares/auth");

const router = express.Router();

router.route("/")
    .get(types.findAll)
    .post(auth.verifyToken, auth.verifyAdmin, types.create)
    
router.route("/:id")
    .get(types.findOne)
    .put(auth.verifyToken ,auth.verifyAdmin, types.update)
    .delete(auth.verifyToken ,auth.verifyAdmin, types.delete)

module.exports = router;