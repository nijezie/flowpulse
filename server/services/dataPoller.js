const { pool } = require("../config/database")

// Mock chains and stablecoins for initial development
const CHAINS = ["ethereum", "polygon", "arbitrum", "optimism", "solana", "bsc"]
const STABLECOINS = ["USDC", "USDT", "DAI", "BUSD"]

// Generate mock stablecoin flow data
const generateMockFlowData = () => {
  const flows = []
  const now = new Date()

  // Generate flows for different time intervals
  ;["1m", "5m", "15m"].forEach((interval) => {
    for (let i = 0; i < 10; i++) {
      const chainFrom = CHAINS[Math.floor(Math.random() * CHAINS.length)]
      let chainTo = CHAINS[Math.floor(Math.random() * CHAINS.length)]

      // Ensure different chains
      while (chainTo === chainFrom) {
        chainTo = CHAINS[Math.floor(Math.random() * CHAINS.length)]
      }

      const coin = STABLECOINS[Math.floor(Math.random() * STABLECOINS.length)]
      const amount = (Math.random() * 10000000 + 100000) * (Math.random() > 0.5 ? 1 : -1) // Positive = inflow, Negative = outflow

      flows.push({
        chain_from: chainFrom,
        chain_to: chainTo,
        coin,
        amount,
        interval_type: interval,
        timestamp: new Date(now.getTime() - Math.random() * 1800000), // Random time within last 30 minutes
      })
    }
  })

  return flows
}

const pollStablecoinData = async () => {
  console.log("Polling stablecoin data...")

  try {
    const mockData = generateMockFlowData()
    const client = await pool.connect()

    try {
      for (const flow of mockData) {
        await client.query(
          "INSERT INTO flows (chain_from, chain_to, coin, amount, interval_type, timestamp) VALUES ($1, $2, $3, $4, $5, $6)",
          [flow.chain_from, flow.chain_to, flow.coin, flow.amount, flow.interval_type, flow.timestamp],
        )
      }

      // Broadcast new data to connected clients
      if (global.broadcast) {
        global.broadcast({
          type: "FLOW_UPDATE",
          data: mockData,
        })
      }

      console.log(`Inserted ${mockData.length} flow records`)

      // Check for alert triggers
      await checkAlertTriggers()
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Error polling stablecoin data:", error)
  }
}

const checkAlertTriggers = async () => {
  const client = await pool.connect()

  try {
    // Get active alerts
    const alertsResult = await client.query("SELECT * FROM alerts WHERE is_active = true AND triggered_at IS NULL")

    for (const alert of alertsResult.rows) {
      // Check recent flows for this chain pair
      const flowsResult = await client.query(
        `
        SELECT SUM(amount) as total_amount 
        FROM flows 
        WHERE chain_from = $1 AND chain_to = $2 
        AND timestamp > NOW() - INTERVAL '5 minutes'
        AND interval_type = '1m'
      `,
        [alert.chain_from, alert.chain_to],
      )

      const totalAmount = Number.parseFloat(flowsResult.rows[0]?.total_amount || 0)
      const shouldTrigger =
        (alert.alert_type === "inflow" && totalAmount > alert.threshold_amount) ||
        (alert.alert_type === "outflow" && Math.abs(totalAmount) > alert.threshold_amount && totalAmount < 0)

      if (shouldTrigger) {
        await client.query("UPDATE alerts SET triggered_at = NOW() WHERE id = $1", [alert.id])

        // Broadcast alert
        if (global.broadcast) {
          global.broadcast({
            type: "ALERT_TRIGGERED",
            data: {
              ...alert,
              triggered_amount: totalAmount,
            },
          })
        }

        console.log(`Alert triggered: ${alert.alert_type} for ${alert.chain_from} -> ${alert.chain_to}`)
      }
    }
  } finally {
    client.release()
  }
}

module.exports = { pollStablecoinData }
