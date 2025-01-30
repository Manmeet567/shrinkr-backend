const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const {
  createLink,
  getLinks,
  updateLink,
  deleteLink
} = require("../controllers/linkControllers");

router.use(requireAuth);

router.post("/create-link", createLink);

router.get("/get-links", getLinks);

router.put("/update-link/:_id", updateLink);

router.delete("/delete-link/:id", deleteLink);

module.exports = router;
