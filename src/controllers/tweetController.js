const { db } = require("../db/database")

/**
 * Fetches the authenticated user's feed.
 * Returns the latest tweets posted by the people the user follows.
 * Limited to 4 tweets for lightweight feed previews.
 */
exports.getFeed = async (req, res) => {
  const { userId } = req

  const rows = await db.all(
    `
      SELECT user.username, tweet.tweet, tweet.date_time AS dateTime
      FROM follower
      INNER JOIN tweet ON follower.following_user_id = tweet.user_id
      INNER JOIN user ON tweet.user_id = user.user_id
      WHERE follower.follower_user_id = ?
      ORDER BY tweet.date_time DESC
      LIMIT 4;
    `,
    [userId]
  )

  res.send(rows)
}

/**
 * Creates a new tweet under the logged-in user.
 * Stores text content along with timestamp.
 */
exports.createTweet = async (req, res) => {
  const { userId } = req
  const { tweet } = req.body

  await db.run(
    `
      INSERT INTO tweet (tweet, user_id, date_time)
      VALUES (?, ?, datetime('now'));
    `,
    [tweet, userId]
  )

  res.send("Created a Tweet")
}

/**
 * Deletes a tweet created by the authenticated user.
 * Ownership check ensures users cannot delete someone else's tweet.
 */
exports.deleteTweet = async (req, res) => {
  const { tweetId } = req.params
  const { userId } = req

  const row = await db.get(
    `SELECT tweet_id FROM tweet WHERE tweet_id = ? AND user_id = ?`,
    [tweetId, userId]
  )

  // User does not own the tweet
  if (!row) return res.status(401).send("Invalid Request")

  await db.run(`DELETE FROM tweet WHERE tweet_id = ?`, [tweetId])

  res.send("Tweet Removed")
}

/**
 * Fetches full tweet details including:
 * - tweet content
 * - total likes
 * - total replies
 * Useful for tweet detail pages.
 */
exports.getTweetDetails = async (req, res) => {
  const { tweetId } = req.params

  const row = await db.get(
    `
      SELECT 
        tweet.tweet,
        COUNT(DISTINCT like.like_id) AS likes,
        COUNT(DISTINCT reply.reply_id) AS replies,
        tweet.date_time AS dateTime
      FROM tweet
      LEFT JOIN like ON tweet.tweet_id = like.tweet_id
      LEFT JOIN reply ON tweet.tweet_id = reply.tweet_id
      WHERE tweet.tweet_id = ?
      GROUP BY tweet.tweet_id;
    `,
    [tweetId]
  )

  res.send(row)
}

/**
 * Returns the list of usernames who liked a tweet.
 * Provides just the names for clean API responses.
 */
exports.getLikes = async (req, res) => {
  const { tweetId } = req.params

  const rows = await db.all(
    `
      SELECT user.username
      FROM like
      INNER JOIN user ON like.user_id = user.user_id
      WHERE like.tweet_id = ?;
    `,
    [tweetId]
  )

  res.send({ likes: rows.map((r) => r.username) })
}

/**
 * Returns all replies for a tweet including:
 * - name of replier
 * - reply text
 * Good for threaded discussions.
 */
exports.getReplies = async (req, res) => {
  const { tweetId } = req.params

  const rows = await db.all(
    `
      SELECT user.name, reply.reply
      FROM reply
      INNER JOIN user ON reply.user_id = user.user_id
      WHERE reply.tweet_id = ?;
    `,
    [tweetId]
  )

  res.send({ replies: rows })
}
