const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const path = require("path")

// Load environment variables
dotenv.config()

const app = express()

// Import routes and services with error handling
let flowRoutes, alertRoutes, betRoutes, pollStablecoinData, initDatabase

try {
  flowRoutes = require("./routes/flows")
  alertRoutes = require("./routes/alerts")
  betRoutes = require("./routes/bets")
  const dataPoller = require("./services/dataPoller")
  pollStablecoinData = dataPoller.pollStablecoinData
  const database = require("./config/database")
  initDatabase = database.initDatabase
} catch (error) {
  console.error("Error loading modules:", error)
}

// Middleware
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? true // Allow all origins in production for now
        : ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  }),
)
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  const buildPath = path.join(__dirname, "../client/build")
  app.use(express.static(buildPath))
  console.log("Serving static files from:", buildPath)
}

// Routes with error handling
if (flowRoutes) app.use("/api/flows", flowRoutes)
if (alertRoutes) app.use("/api/alerts", alertRoutes)
if (betRoutes) app.use("/api/bets", betRoutes)

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    database: process.env.DATABASE_URL ? "configured" : "not configured",
  })
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Server error:", error)
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === "production" ? "Internal server error" : error.message,
  })
})

// Serve React app for all non-API routes in production
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    const indexPath = path.join(__dirname, "../client/build/index.html")
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error("Error serving index.html:", err)
        res.status(500).send("Error loading application")
      }
    })
  })
}

// Initialize database and start server
const startServer = async () => {
  try {
    if (initDatabase) {
      await initDatabase()
      console.log("Database initialized successfully")
    } else {
      console.log("Database initialization skipped - module not loaded")
    }

    // Start data polling only if enabled
    if (process.env.ENABLE_POLLING === "true" && pollStablecoinData) {
      const cron = require("node-cron")
      cron.schedule("*/30 * * * * *", async () => {
        try {
          await pollStablecoinData()
        } catch (error) {
          console.error("Error in data polling:", error)
        }
      })
      console.log("Data polling started")
    }

    const PORT = process.env.PORT || 3001
    app.listen(PORT, () => {
      console.log(`FlowPulse server running on port ${PORT}`)
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`)
    })
  } catch (error) {
    console.error("Failed to start server:", error)
    // Don't exit in production, just log the error
    if (process.env.NODE_ENV !== "production") {
      process.exit(1)
    }
  }
}

startServer()

// Export for Vercel
module.exports = app
