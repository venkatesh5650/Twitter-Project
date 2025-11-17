const app = require("./app")
const { initializeDB } = require("./db/database")

/**
 * Entry Point:
 * Initializes the database connection and starts the Express server.
 * Ensures the app only runs after a successful DB setup.
 */
initializeDB().then(() => {
  app.listen(3000, () => {
    console.log("Server running on http://localhost:3000")
  })
})
