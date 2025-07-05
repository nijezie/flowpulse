const { Pool } = require("pg")

let pool

try {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  })
} catch (error) {
  console.error("Database pool creation failed:", error)
}

const initDatabase = async () => {
  if (!pool) {
    throw new Error("Database pool not initialized")
  }

  const client = await pool.connect()

  try {
    console.log("🗄️  Initializing FlowPulse database...")

    // Create flows table
    await client.query(`
      CREATE TABLE IF NOT EXISTS flows (
        id SERIAL PRIMARY KEY,
        chain_from VARCHAR(50) NOT NULL,
        chain_to VARCHAR(50) NOT NULL,
        coin VARCHAR(20) NOT NULL,
        amount DECIMAL(20, 6) NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        interval_type VARCHAR(10) NOT NULL,
        transaction_count INTEGER DEFAULT 1,
        latest_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create alerts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS alerts (
        id SERIAL PRIMARY KEY,
        chain_from VARCHAR(50) NOT NULL,
        chain_to VARCHAR(50) NOT NULL,
        threshold_amount DECIMAL(20, 6) NOT NULL,
        alert_type VARCHAR(20) NOT NULL CHECK (alert_type IN ('inflow', 'outflow')),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        triggered_at TIMESTAMP,
        trigger_count INTEGER DEFAULT 0
      )
    `)

    // Create bets table
    await client.query(`
      CREATE TABLE IF NOT EXISTS bets (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        chain_from VARCHAR(50) NOT NULL,
        chain_to VARCHAR(50) NOT NULL,
        direction VARCHAR(20) NOT NULL CHECK (direction IN ('inflow', 'outflow')),
        amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
        odds DECIMAL(5, 2) NOT NULL CHECK (odds > 0),
        potential_payout DECIMAL(10, 2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost', 'cancelled')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP
      )
    `)

    // Insert sample data if tables are empty
    const flowCount = await client.query("SELECT COUNT(*) FROM flows")
    if (Number.parseInt(flowCount.rows[0].count) === 0) {
      console.log("📊 Inserting sample data...")

      const sampleFlows = [
        ["ethereum", "polygon", "USDC", 1500000, "1m", 5],
        ["polygon", "arbitrum", "USDT", -800000, "1m", 3],
        ["arbitrum", "optimism", "DAI", 2200000, "5m", 8],
        ["solana", "ethereum", "USDC", -1200000, "5m", 12],
        ["bsc", "polygon", "BUSD", 950000, "15m", 6],
      ]

      for (const [from, to, coin, amount, interval, txCount] of sampleFlows) {
        await client.query(
          `INSERT INTO flows (chain_from, chain_to, coin, amount, interval_type, transaction_count, timestamp, latest_timestamp)
           VALUES ($1, $2, $3, $4, $5, $6, NOW() - INTERVAL '${Math.floor(Math.random() * 60)} minutes', NOW())`,
          [from, to, coin, amount, interval, txCount],
        )
      }
    }

    console.log("✅ Database initialization completed successfully!")
  } finally {
    client.release()
  }
}

module.exports = { pool, initDatabase }
