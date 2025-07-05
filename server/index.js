const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const cron = require("node-cron")
const WebSocket = require("ws")
const http = require("http")
const path = require("path")

// Load environment variables
dotenv.config()

const app = express()
const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

// Import routes and services
const flowRoutes = require("./routes/flows")
const alertRoutes = require("./routes/alerts")
const betRoutes = require("./routes/bets")
const { pollStablecoinData } = require("./services/dataPoller")
const { initDatabase } = require("./config/database")

// Middleware
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://your-domain.vercel.app"] // Replace with your actual domain
        : ["http://localhost:3000"],
    credentials: true,
  }),
)
app.use(express.json())

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")))
}

// Routes
app.use("/api/flows", flowRoutes)
app.use("/api/alerts", alertRoutes)
app.use("/api/bets", betRoutes)

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  })
})

// Serve React app for all non-API routes in production
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build/index.html"))
  })
}

// WebSocket connection for real-time updates
wss.on("connection", (ws) => {
  console.log("Client connected to WebSocket")

  ws.on("close", () => {
    console.log("Client disconnected from WebSocket")
  })
})

// Broadcast function for real-time updates
const broadcast = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data))
    }
  })
}

// Make broadcast available globally
global.broadcast = broadcast

// Initialize database and start polling
const startServer = async () => {
  try {
    await initDatabase()
    console.log("Database initialized successfully")

    // Start data polling every 30 seconds (only in production or when explicitly enabled)
    if (process.env.NODE_ENV === "production" || process.env.ENABLE_POLLING === "true") {
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
    process.exit(1)
  }
}

startServer()

// Export for Vercel
module.exports = app
