const express = require("express");
const router = express.Router();
const {
  loginUser,
  signupUser,
  getUserData,
  updateUserInfo,
  deleteAccount
} = require("../controllers/userControllers");
const requireAuth = require("../middleware/requireAuth");

router.post("/login", loginUser);

router.post("/signup", signupUser);

router.get("/get-user", requireAuth, getUserData);

router.patch('/update-user-info', requireAuth, updateUserInfo);

router.delete('/delete-account/:id', requireAuth, deleteAccount);

module.exports = router;
