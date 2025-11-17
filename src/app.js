const express = require("express")
const app = express()

// Parse JSON bodies for all incoming requests
app.use(express.json())

// Import Route Modules
const authRoutes = require("./routes/authRoutes")
const tweetRoutes = require("./routes/tweetRoutes")
const followRoutes = require("./routes/followRoutes")
const userRoutes = require("./routes/userRoutes")

/**
 * API Route Registration:
 * Organized by feature modules for clean, scalable structure.
 */
app.use("/api/auth", authRoutes)      // Authentication (register, login)
app.use("/api/tweets", tweetRoutes)  // Tweet creation + feed + details
app.use("/api/user", userRoutes)     // User-specific actions
app.use("/api/user", followRoutes)   // Followers / Following lists

module.exports = app
