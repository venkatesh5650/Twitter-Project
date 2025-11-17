const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");

/**
 * Auth Routes:
 * Handles user onboarding and access authentication.
 */

// Create a new user account
router.post("/register", register);

// Authenticate user & issue JWT
router.post("/login", login);

module.exports = router;
