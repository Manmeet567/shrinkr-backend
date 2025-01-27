const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const { createLink, getLinks } = require("../controllers/linkControllers");

router.use(requireAuth);

router.post("/create-link", createLink);

router.get("/get-links", getLinks);

module.exports = router;
