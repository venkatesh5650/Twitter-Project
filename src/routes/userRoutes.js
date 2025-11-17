const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticateToken");
const { db } = require("../db/database");

/**
 * Returns all tweets created by the authenticated user.
 * Includes aggregated like and reply counts for dashboard/profile views.
 */
router.get("/tweets", authenticate, async (req, res) => {
  const { userId } = req;

  const rows = await db.all(
    `
      SELECT 
        tweet.tweet,
        COUNT(DISTINCT like.like_id) AS likes,
        COUNT(DISTINCT reply.reply_id) AS replies,
        tweet.date_time AS dateTime
      FROM tweet
      LEFT JOIN like ON tweet.tweet_id = like.tweet_id
      LEFT JOIN reply ON tweet.tweet_id = reply.tweet_id
      WHERE tweet.user_id = ?
      GROUP BY tweet.tweet_id;
    `,
    [userId]
  );

  res.send(rows);
});

module.exports = router;
