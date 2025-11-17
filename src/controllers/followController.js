const { db } = require("../db/database")

/**
 * Returns the list of users the authenticated user is following.
 * Useful for "Following" sections or social graph features.
 */
exports.getFollowing = async (req, res) => {
  const { userId } = req

  const rows = await db.all(
    `
      SELECT user.name
      FROM follower
      INNER JOIN user ON follower.following_user_id = user.user_id
      WHERE follower.follower_user_id = ?;
    `,
    [userId]
  )

  res.send(rows)
}

/**
 * Returns the list of users who follow the authenticated user.
 * Helps track audience, followers list, and engagement.
 */
exports.getFollowers = async (req, res) => {
  const { userId } = req

  const rows = await db.all(
    `
      SELECT user.name
      FROM follower
      INNER JOIN user ON follower.follower_user_id = user.user_id
      WHERE follower.following_user_id = ?;
    `,
    [userId]
  )

  res.send(rows)
}
