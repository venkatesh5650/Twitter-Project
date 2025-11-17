const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticateToken");
const verifyTweet = require("../middlewares/tweetAccessVerification");
const {
  getFeed,
  createTweet,
  deleteTweet,
  getTweetDetails,
  getLikes,
  getReplies,
} = require("../controllers/tweetController");

/**
 * Tweet Routes:
 * Handles feed retrieval, tweet creation, deletion,
 * and access-protected tweet interactions (likes, replies, details).
 */

// Get latest tweets from people the user follows
router.get("/feed", authenticate, getFeed);

// Create a new tweet
router.post("/", authenticate, createTweet);

// Delete a tweet owned by the authenticated user
router.delete("/:tweetId", authenticate, deleteTweet);

// Tweet detail routes (protected by follow-access verification)
router.get("/:tweetId", authenticate, verifyTweet, getTweetDetails);
router.get("/:tweetId/likes", authenticate, verifyTweet, getLikes);
router.get("/:tweetId/replies", authenticate, verifyTweet, getReplies);

module.exports = router;
