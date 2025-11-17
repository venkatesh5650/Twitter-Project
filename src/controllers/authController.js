const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { db } = require("../db/database")

/**
 * Controller: Register a new user.
 * Validates input, checks for duplicates, hashes password,
 * and inserts a fresh user record into the database.
 */
exports.register = async (req, res) => {
  try {
    const { username, name, password, gender } = req.body

    // Check if username already exists → prevents duplicates
    const existingUser = await db.get(
      "SELECT * FROM user WHERE username = ?",
      [username]
    )
    if (existingUser) return res.status(400).send("User already exists")

    // Basic password policy enforcement
    if (!password || password.length < 6)
      return res.status(400).send("Password is too short")

    // Secure password hashing using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user record
    await db.run(
      `INSERT INTO user (username, name, password, gender)
       VALUES (?, ?, ?, ?)`,
      [username, name, hashedPassword, gender]
    )

    res.send("User created successfully")
  } catch (error) {
    // Unexpected failures → generic server error
    res.status(500).send("Server Error")
  }
}

/**
 * Controller: Login an existing user.
 * Verifies credentials, compares password hash,
 * and issues a signed JWT for session authentication.
 */
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body

    // Validate username existence
    const user = await db.get(
      "SELECT * FROM user WHERE username = ?",
      [username]
    )
    if (!user) return res.status(400).send("Invalid user")

    // Validate password against the stored hash
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) return res.status(400).send("Invalid password")

    // JWT Payload contains essential identifiable info
    const payload = { username: user.username, userId: user.user_id }

    // Generate authentication token
    const token = jwt.sign(payload, "MY_SECRET_TOKEN")

    res.send({ jwtToken: token })
  } catch (error) {
    res.status(500).send("Server Error")
  }
}
