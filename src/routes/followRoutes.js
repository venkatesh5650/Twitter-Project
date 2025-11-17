const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticateToken");
const {
  getFollowing,
  getFollowers,
} = require("../controllers/followController");

/**
 * Follow Routes:
 * Provides endpoints to view the user's social graph
 * — who they follow and who follows them.
 */

// List of users the authenticated user is following
router.get("/following", authenticate, getFollowing);

// List of users who follow the authenticated user
router.get("/followers", authenticate, getFollowers);

module.exports = router;
