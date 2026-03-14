const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  registerUser,
  loginUser,
  getMe,
} = require("../controllers/user.controller");

/* ========== REGISTER ========== */
router.post("/register", registerUser);

/* ========== LOGIN ========== */
router.post("/login", loginUser);

/* ========== GET LOGGED IN USER ========== */
router.get("/me", auth, getMe);

module.exports = router;
