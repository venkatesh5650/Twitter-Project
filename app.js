const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'twitterClone.db')
let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({filename: dbPath, driver: sqlite3.Database})
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()

// -------------------- API 1: Register --------------------
app.post('/register/', async (request, response) => {
  try {
    const {username, name, password, gender} = request.body
    const userRow = await db.get(`SELECT * FROM user WHERE username = ?`, [
      username,
    ])
    if (userRow !== undefined) {
      response.status(400)
      return response.send('User already exists')
    }
    if (!password || password.length < 6) {
      response.status(400)
      return response.send('Password is too short')
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    await db.run(
      `INSERT INTO user (username, name, password, gender) VALUES (?, ?, ?, ?)`,
      [username, name, hashedPassword, gender],
    )
    response.status(200).send('User created successfully')
  } catch (e) {
    response.status(500).send('Server Error')
  }
})

// -------------------- API 2: Login --------------------
app.post('/login/', async (request, response) => {
  try {
    const {username, password} = request.body
    const dbUser = await db.get(`SELECT * FROM user WHERE username = ?`, [
      username,
    ])
    if (dbUser === undefined) {
      response.status(400)
      return response.send('Invalid user')
    }
    const isValid = await bcrypt.compare(password, dbUser.password)
    if (!isValid) {
      response.status(400)
      return response.send('Invalid password')
    }
    // ✅ include userId in token payload
    const payload = {username: dbUser.username, userId: dbUser.user_id}
    const jwtToken = jwt.sign(payload, 'MY_SECRET_TOKEN')
    response.send({jwtToken})
  } catch (e) {
    response.status(500).send('Server Error')
  }
})

// -------------------- Auth Middleware --------------------
const authenticateToken = (request, response, next) => {
  let jwtToken
  const authHeader = request.headers['authorization']
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(' ')[1]
  }
  if (jwtToken === undefined) {
    response.status(401)
    return response.send('Invalid JWT Token')
  }
  jwt.verify(jwtToken, 'MY_SECRET_TOKEN', (error, payload) => {
    if (error) {
      response.status(401)
      response.send('Invalid JWT Token')
    } else {
      request.username = payload.username
      request.userId = payload.userId
      next()
    }
  })
}

// -------------------- Follower Access Check --------------------
const tweetAccessVerification = async (request, response, next) => {
  try {
    const {userId} = request
    const {tweetId} = request.params
    const row = await db.get(
      `
      SELECT 1
      FROM tweet 
      INNER JOIN follower 
        ON tweet.user_id = follower.following_user_id
      WHERE tweet.tweet_id = ? AND follower.follower_user_id = ?;
    `,
      [tweetId, userId],
    )
    if (!row) {
      response.status(401)
      return response.send('Invalid Request')
    }
    next()
  } catch (e) {
    response.status(500).send('Server Error')
  }
}

// -------------------- API 3: Feed --------------------
app.get('/user/tweets/feed/', authenticateToken, async (request, response) => {
  const {userId} = request
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
    [userId],
  )
  response.send(rows)
})

// -------------------- API 4: Following --------------------
app.get('/user/following/', authenticateToken, async (request, response) => {
  const {userId} = request
  const rows = await db.all(
    `
    SELECT user.name
    FROM follower 
    INNER JOIN user ON follower.following_user_id = user.user_id
    WHERE follower.follower_user_id = ?;
  `,
    [userId],
  )
  response.send(rows)
})

// -------------------- API 5: Followers --------------------
app.get('/user/followers/', authenticateToken, async (request, response) => {
  const {userId} = request
  const rows = await db.all(
    `
    SELECT user.name
    FROM follower 
    INNER JOIN user ON follower.follower_user_id = user.user_id
    WHERE follower.following_user_id = ?;
  `,
    [userId],
  )
  response.send(rows)
})

// -------------------- API 6: Tweet details --------------------
app.get(
  '/tweets/:tweetId/',
  authenticateToken,
  tweetAccessVerification,
  async (request, response) => {
    const {tweetId} = request.params
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
      [tweetId],
    )
    response.send(row)
  },
)

// -------------------- API 7: Likes (usernames) --------------------
app.get(
  '/tweets/:tweetId/likes/',
  authenticateToken,
  tweetAccessVerification,
  async (request, response) => {
    const {tweetId} = request.params
    const rows = await db.all(
      `
      SELECT user.username
      FROM like 
      INNER JOIN user ON like.user_id = user.user_id
      WHERE like.tweet_id = ?;
    `,
      [tweetId],
    )
    response.send({likes: rows.map(r => r.username)})
  },
)

// -------------------- API 8: Replies (name, reply) --------------------
app.get(
  '/tweets/:tweetId/replies/',
  authenticateToken,
  tweetAccessVerification,
  async (request, response) => {
    const {tweetId} = request.params
    const rows = await db.all(
      `
      SELECT user.name, reply.reply
      FROM reply 
      INNER JOIN user ON reply.user_id = user.user_id
      WHERE reply.tweet_id = ?;
    `,
      [tweetId],
    )
    response.send({replies: rows.map(r => ({name: r.name, reply: r.reply}))})
  },
)

// -------------------- API 9: User's tweets --------------------
app.get('/user/tweets/', authenticateToken, async (request, response) => {
  const {userId} = request
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
    [userId],
  )
  response.send(rows)
})

// -------------------- API 10: Create tweet --------------------
app.post('/user/tweets/', authenticateToken, async (request, response) => {
  const {userId} = request
  const {tweet} = request.body
  await db.run(
    `
    INSERT INTO tweet (tweet, user_id, date_time)
    VALUES (?, ?, datetime('now'));
  `,
    [tweet, userId],
  )
  response.send('Created a Tweet')
})

// -------------------- API 11: Delete tweet (own only) --------------------
app.delete(
  '/tweets/:tweetId/',
  authenticateToken,
  async (request, response) => {
    const {tweetId} = request.params
    const {userId} = request

    const row = await db.get(
      `SELECT tweet_id FROM tweet WHERE tweet_id = ? AND user_id = ?;`,
      [tweetId, userId],
    )
    if (!row) {
      response.status(401)
      return response.send('Invalid Request')
    }

    await db.run(`DELETE FROM tweet WHERE tweet_id = ?;`, [tweetId])
    response.send('Tweet Removed')
  },
)

module.exports = app
