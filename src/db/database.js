const path = require("path")
const { open } = require("sqlite")
const sqlite3 = require("sqlite3")

// Resolves the absolute path to the SQLite database file
// Helps maintain portability across environments
const dbPath = path.join(__dirname, "../../twitterClone.db")

// Shared DB connection instance
let db = null

/**
 * Initializes and returns a SQLite database connection.
 * Uses `sqlite` wrapper for better async/await support.
 * This function centralizes DB setup, improving testability and maintainability.
 */
async function initializeDB() {
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database, // Standard SQLite driver
  })

  return db // Exposes the active DB connection for use across modules
}

// Exporting both initializer and db reference for modular usage
module.exports = { initializeDB, db }
