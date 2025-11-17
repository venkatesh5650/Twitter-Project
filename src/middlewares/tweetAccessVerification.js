const { db } = require("../db/database")

/**
 * Middleware: Verifies whether the logged-in user has permission
 * to view or interact with a specific tweet.
 *
 * Rule: A user can access a tweet only if they follow the tweet's author.
 * Ensures privacy and prevents unauthorized tweet access.
 */
const tweetAccessVerification = async (req, res, next) => {
  try {
    const { userId } = req
    const { tweetId } = req.params

    // Check if the user follows the tweet owner
    const row = await db.get(
      `
        SELECT 1
        FROM tweet
        INNER JOIN follower 
          ON tweet.user_id = follower.following_user_id
        WHERE tweet.tweet_id = ? 
          AND follower.follower_user_id = ?;
      `,
      [tweetId, userId]
    )

    // No relational match → user is not allowed to access the tweet
    if (!row) return res.status(401).send("Invalid Request")

    next()
  } catch (error) {
    // Generic error response for unexpected DB failures
    res.status(500).send("Server Error")
  }
}

module.exports = tweetAccessVerification
