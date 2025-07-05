const express = require("express")
const { pool } = require("../config/database")

const router = express.Router()

// GET /api/flows - Get recent stablecoin flows
router.get("/", async (req, res) => {
  try {
    const { interval = "1m", limit = 100 } = req.query

    const result = await pool.query(
      `
      SELECT 
        chain_from,
        chain_to,
        coin,
        SUM(amount) as net_amount,
        COUNT(*) as transaction_count,
        MAX(timestamp) as latest_timestamp
      FROM flows 
      WHERE interval_type = $1 
      AND timestamp > NOW() - INTERVAL '1 hour'
      GROUP BY chain_from, chain_to, coin
      ORDER BY latest_timestamp DESC
      LIMIT $2
    `,
      [interval, limit],
    )

    res.json({
      success: true,
      data: result.rows,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching flows:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch flows",
    })
  }
})

// GET /api/flows/heatmap - Get heatmap data
router.get("/heatmap", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        chain_from,
        chain_to,
        interval_type,
        SUM(amount) as net_amount,
        COUNT(*) as transaction_count
      FROM flows 
      WHERE timestamp > NOW() - INTERVAL '1 hour'
      GROUP BY chain_from, chain_to, interval_type
      ORDER BY chain_from, chain_to, interval_type
    `)

    res.json({
      success: true,
      data: result.rows,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching heatmap data:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch heatmap data",
    })
  }
})

// GET /api/flows/timeseries - Get time series data for charts
router.get("/timeseries", async (req, res) => {
  try {
    const { chain_from, chain_to, hours = 24 } = req.query

    if (!chain_from || !chain_to) {
      return res.status(400).json({
        success: false,
        error: "chain_from and chain_to parameters are required",
      })
    }

    const result = await pool.query(
      `
      SELECT 
        DATE_TRUNC('minute', timestamp) as time_bucket,
        SUM(amount) as net_amount,
        COUNT(*) as transaction_count
      FROM flows 
      WHERE chain_from = $1 AND chain_to = $2
      AND timestamp > NOW() - INTERVAL '${hours} hours'
      GROUP BY time_bucket
      ORDER BY time_bucket
    `,
      [chain_from, chain_to],
    )

    res.json({
      success: true,
      data: result.rows,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching timeseries data:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch timeseries data",
    })
  }
})

module.exports = router
