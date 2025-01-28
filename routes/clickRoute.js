const express = require("express");
const router = express.Router();
const { submitClick, getClicks } = require("../controllers/clickControllers");
const requireAuth = require("../middleware/requireAuth");

router.get("/:url_id", submitClick);

router.post("/get-clicks", requireAuth, getClicks);

module.exports = router;
