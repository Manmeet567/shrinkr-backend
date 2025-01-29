const express = require("express");
const router = express.Router();
const {
  getClicks,
  getClickAnalytics,
} = require("../controllers/clickControllers");
const requireAuth = require("../middleware/requireAuth");

router.post("/get-clicks", requireAuth, getClicks);

router.get("/analytics", requireAuth, getClickAnalytics);

module.exports = router;
