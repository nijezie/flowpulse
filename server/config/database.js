const { Pool } = require("pg")

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://localhost:5432/flowpulse",
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

const initDatabase = async () => {
  const client = await pool.connect()

  try {
    // Create flows table
    await client.query(`
      CREATE TABLE IF NOT EXISTS flows (
        id SERIAL PRIMARY KEY,
        chain_from VARCHAR(50) NOT NULL,
        chain_to VARCHAR(50) NOT NULL,
        coin VARCHAR(20) NOT NULL,
        amount DECIMAL(20, 6) NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        interval_type VARCHAR(10) NOT NULL -- '1m', '5m', '15m'
      )
    `)

    // Create alerts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS alerts (
        id SERIAL PRIMARY KEY,
        chain_from VARCHAR(50) NOT NULL,
        chain_to VARCHAR(50) NOT NULL,
        threshold_amount DECIMAL(20, 6) NOT NULL,
        alert_type VARCHAR(20) NOT NULL, -- 'inflow' or 'outflow'
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        triggered_at TIMESTAMP
      )
    `)

    // Create bets table
    await client.query(`
      CREATE TABLE IF NOT EXISTS bets (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        chain_from VARCHAR(50) NOT NULL,
        chain_to VARCHAR(50) NOT NULL,
        direction VARCHAR(20) NOT NULL, -- 'inflow' or 'outflow'
        amount DECIMAL(10, 2) NOT NULL,
        odds DECIMAL(5, 2) NOT NULL,
        potential_payout DECIMAL(10, 2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'won', 'lost'
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP
      )
    `)

    console.log("Database tables created successfully")
  } finally {
    client.release()
  }
}

module.exports = { pool, initDatabase }
