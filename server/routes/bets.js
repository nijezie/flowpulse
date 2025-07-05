const express = require("express")
const { pool } = require("../config/database")

const router = express.Router()

// GET /api/bets - Get user bets
router.get("/", async (req, res) => {
  try {
    const { user_id } = req.query

    let query = "SELECT * FROM bets ORDER BY created_at DESC"
    let params = []

    if (user_id) {
      query = "SELECT * FROM bets WHERE user_id = $1 ORDER BY created_at DESC"
      params = [user_id]
    }

    const result = await pool.query(query, params)

    res.json({
      success: true,
      data: result.rows,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching bets:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch bets",
    })
  }
})

// POST /api/bets - Place a new bet
router.post("/", async (req, res) => {
  try {
    const { user_id, chain_from, chain_to, direction, amount } = req.body

    if (!user_id || !chain_from || !chain_to || !direction || !amount) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      })
    }

    if (!["inflow", "outflow"].includes(direction)) {
      return res.status(400).json({
        success: false,
        error: 'direction must be either "inflow" or "outflow"',
      })
    }

    // Calculate odds based on recent flow patterns (simplified)
    const flowResult = await pool.query(
      `
      SELECT AVG(amount) as avg_amount, COUNT(*) as flow_count
      FROM flows 
      WHERE chain_from = $1 AND chain_to = $2 
      AND timestamp > NOW() - INTERVAL '1 hour'
    `,
      [chain_from, chain_to],
    )

    const avgAmount = Number.parseFloat(flowResult.rows[0]?.avg_amount || 0)
    const flowCount = Number.parseInt(flowResult.rows[0]?.flow_count || 0)

    // Simple odds calculation (in production, this would be more sophisticated)
    let odds = 2.0 // Default odds
    if (flowCount > 0) {
      const isInflowLikely = avgAmount > 0
      const betMatchesTrend = (direction === "inflow" && isInflowLikely) || (direction === "outflow" && !isInflowLikely)
      odds = betMatchesTrend ? 1.5 : 3.0 // Lower odds if betting with the trend
    }

    const potentialPayout = amount * odds

    const result = await pool.query(
      `
      INSERT INTO bets (user_id, chain_from, chain_to, direction, amount, odds, potential_payout)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `,
      [user_id, chain_from, chain_to, direction, amount, odds, potentialPayout],
    )

    res.status(201).json({
      success: true,
      data: result.rows[0],
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error placing bet:", error)
    res.status(500).json({
      success: false,
      error: "Failed to place bet",
    })
  }
})

// GET /api/bets/odds - Get current odds for a chain pair
router.get("/odds", async (req, res) => {
  try {
    const { chain_from, chain_to } = req.query

    if (!chain_from || !chain_to) {
      return res.status(400).json({
        success: false,
        error: "chain_from and chain_to parameters are required",
      })
    }

    // Calculate odds based on recent flow patterns
    const flowResult = await pool.query(
      `
      SELECT 
        AVG(amount) as avg_amount, 
        COUNT(*) as flow_count,
        SUM(CASE WHEN amount > 0 THEN 1 ELSE 0 END) as inflow_count,
        SUM(CASE WHEN amount < 0 THEN 1 ELSE 0 END) as outflow_count
      FROM flows 
      WHERE chain_from = $1 AND chain_to = $2 
      AND timestamp > NOW() - INTERVAL '1 hour'
    `,
      [chain_from, chain_to],
    )

    const stats = flowResult.rows[0]
    const avgAmount = Number.parseFloat(stats?.avg_amount || 0)
    const inflowCount = Number.parseInt(stats?.inflow_count || 0)
    const outflowCount = Number.parseInt(stats?.outflow_count || 0)
    const totalCount = inflowCount + outflowCount

    let inflowOdds = 2.0
    let outflowOdds = 2.0

    if (totalCount > 0) {
      const inflowProbability = inflowCount / totalCount
      const outflowProbability = outflowCount / totalCount

      // Convert probability to odds (simplified)
      inflowOdds = inflowProbability > 0 ? Math.max(1.1, 1 / inflowProbability) : 5.0
      outflowOdds = outflowProbability > 0 ? Math.max(1.1, 1 / outflowProbability) : 5.0
    }

    res.json({
      success: true,
      data: {
        chain_from,
        chain_to,
        inflow_odds: Math.round(inflowOdds * 100) / 100,
        outflow_odds: Math.round(outflowOdds * 100) / 100,
        recent_stats: {
          avg_amount: avgAmount,
          inflow_count: inflowCount,
          outflow_count: outflowCount,
        },
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error calculating odds:", error)
    res.status(500).json({
      success: false,
      error: "Failed to calculate odds",
    })
  }
})

module.exports = router
