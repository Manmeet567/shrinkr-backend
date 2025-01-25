const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const {createLink} = require("../controllers/linkControllers");

router.use(requireAuth);

router.post("/create-link", createLink);

module.exports = router;