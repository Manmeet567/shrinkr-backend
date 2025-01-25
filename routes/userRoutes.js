const express = require("express");
const router = express.Router();
const {
  loginUser,
  signupUser,
  getUserData,
} = require("../controllers/userControllers");
const requireAuth = require("../middleware/requireAuth");

router.post("/login", loginUser);

router.post("/signup", signupUser);

router.get("/get-user", requireAuth, getUserData);

module.exports = router;
