const express = require("express")
const { pool } = require("../config/database")

const router = express.Router()

// GET /api/alerts - Get all alerts
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM alerts 
      ORDER BY created_at DESC
    `)

    res.json({
      success: true,
      data: result.rows,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching alerts:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch alerts",
    })
  }
})

// POST /api/alerts - Create new alert
router.post("/", async (req, res) => {
  try {
    const { chain_from, chain_to, threshold_amount, alert_type } = req.body

    if (!chain_from || !chain_to || !threshold_amount || !alert_type) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      })
    }

    if (!["inflow", "outflow"].includes(alert_type)) {
      return res.status(400).json({
        success: false,
        error: 'alert_type must be either "inflow" or "outflow"',
      })
    }

    const result = await pool.query(
      `
      INSERT INTO alerts (chain_from, chain_to, threshold_amount, alert_type)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
      [chain_from, chain_to, threshold_amount, alert_type],
    )

    res.status(201).json({
      success: true,
      data: result.rows[0],
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error creating alert:", error)
    res.status(500).json({
      success: false,
      error: "Failed to create alert",
    })
  }
})

// DELETE /api/alerts/:id - Delete alert
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query("DELETE FROM alerts WHERE id = $1 RETURNING *", [id])

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Alert not found",
      })
    }

    res.json({
      success: true,
      message: "Alert deleted successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error deleting alert:", error)
    res.status(500).json({
      success: false,
      error: "Failed to delete alert",
    })
  }
})

// PUT /api/alerts/:id/toggle - Toggle alert active status
router.put("/:id/toggle", async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      `
      UPDATE alerts 
      SET is_active = NOT is_active 
      WHERE id = $1 
      RETURNING *
    `,
      [id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Alert not found",
      })
    }

    res.json({
      success: true,
      data: result.rows[0],
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error toggling alert:", error)
    res.status(500).json({
      success: false,
      error: "Failed to toggle alert",
    })
  }
})

module.exports = router
