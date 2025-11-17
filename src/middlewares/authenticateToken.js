const jwt = require("jsonwebtoken")

/**
 * Middleware: Validates incoming JWT tokens.
 * Ensures only authenticated users can access protected routes.
 * Extracts user details from token and attaches them to the request object.
 */
const authenticateToken = (req, res, next) => {
  // JWT expected in Authorization header -> "Bearer <token>"
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  // No token present → Block access
  if (!token) return res.status(401).send("Invalid JWT Token")

  // Verify token using server secret
  jwt.verify(token, "MY_SECRET_TOKEN", (err, payload) => {
    if (err) return res.status(401).send("Invalid JWT Token")

    // Attach decoded user info for downstream controllers
    req.userId = payload.userId
    req.username = payload.username

    next() // Continue request flow
  })
}

module.exports = authenticateToken
