const { Pool } = require("pg")
const dotenv = require("dotenv")

// Load environment variables
dotenv.config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

const initializeDatabase = async () => {
  const client = await pool.connect()

  try {
    console.log("🗄️  Initializing FlowPulse database...")

    // Create flows table with indexes
    await client.query(`
      CREATE TABLE IF NOT EXISTS flows (
        id SERIAL PRIMARY KEY,
        chain_from VARCHAR(50) NOT NULL,
        chain_to VARCHAR(50) NOT NULL,
        coin VARCHAR(20) NOT NULL,
        amount DECIMAL(20, 6) NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        interval_type VARCHAR(10) NOT NULL,
        block_number BIGINT,
        transaction_hash VARCHAR(66),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create indexes for better query performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_flows_chains 
      ON flows(chain_from, chain_to)
    `)

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_flows_timestamp 
      ON flows(timestamp DESC)
    `)

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_flows_interval 
      ON flows(interval_type, timestamp DESC)
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
        trigger_count INTEGER DEFAULT 0,
        last_checked TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create bets table with enhanced fields
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
        resolved_at TIMESTAMP,
        resolution_amount DECIMAL(20, 6),
        settlement_period_hours INTEGER DEFAULT 24
      )
    `)

    // Create indexes for bets
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_bets_user 
      ON bets(user_id, created_at DESC)
    `)

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_bets_status 
      ON bets(status, created_at DESC)
    `)

    // Create users table for future authentication
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(100) UNIQUE NOT NULL,
        username VARCHAR(50),
        email VARCHAR(255),
        balance DECIMAL(10, 2) DEFAULT 1000.00,
        total_bets INTEGER DEFAULT 0,
        total_winnings DECIMAL(10, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create flow_aggregates table for better performance
    await client.query(`
      CREATE TABLE IF NOT EXISTS flow_aggregates (
        id SERIAL PRIMARY KEY,
        chain_from VARCHAR(50) NOT NULL,
        chain_to VARCHAR(50) NOT NULL,
        coin VARCHAR(20) NOT NULL,
        interval_type VARCHAR(10) NOT NULL,
        time_bucket TIMESTAMP NOT NULL,
        total_amount DECIMAL(20, 6) NOT NULL,
        transaction_count INTEGER NOT NULL,
        avg_amount DECIMAL(20, 6) NOT NULL,
        max_amount DECIMAL(20, 6) NOT NULL,
        min_amount DECIMAL(20, 6) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(chain_from, chain_to, coin, interval_type, time_bucket)
      )
    `)

    // Insert sample data for development
    console.log("📊 Inserting sample data...")

    // Sample flows
    const sampleFlows = [
      ["ethereum", "polygon", "USDC", 1500000, "1m"],
      ["polygon", "arbitrum", "USDT", -800000, "1m"],
      ["arbitrum", "optimism", "DAI", 2200000, "5m"],
      ["solana", "ethereum", "USDC", -1200000, "5m"],
      ["bsc", "polygon", "BUSD", 950000, "15m"],
    ]

    for (const [from, to, coin, amount, interval] of sampleFlows) {
      await client.query(
        `
        INSERT INTO flows (chain_from, chain_to, coin, amount, interval_type, timestamp)
        VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '${Math.floor(Math.random() * 60)} minutes')
        ON CONFLICT DO NOTHING
      `,
        [from, to, coin, amount, interval],
      )
    }

    // Sample alerts
    await client.query(`
      INSERT INTO alerts (chain_from, chain_to, threshold_amount, alert_type)
      VALUES 
        ('ethereum', 'polygon', 1000000, 'inflow'),
        ('polygon', 'arbitrum', 500000, 'outflow'),
        ('solana', 'ethereum', 2000000, 'inflow')
      ON CONFLICT DO NOTHING
    `)

    // Sample user
    await client.query(`
      INSERT INTO users (user_id, username, balance)
      VALUES ('demo_user', 'Demo User', 5000.00)
      ON CONFLICT (user_id) DO NOTHING
    `)

    console.log("✅ Database initialization completed successfully!")
    console.log("📋 Created tables: flows, alerts, bets, users, flow_aggregates")
    console.log("🔍 Created indexes for optimal query performance")
    console.log("📊 Inserted sample data for development")
  } catch (error) {
    console.error("❌ Error initializing database:", error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

// Run initialization
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log("🎉 Database setup complete!")
      process.exit(0)
    })
    .catch((error) => {
      console.error("💥 Database setup failed:", error)
      process.exit(1)
    })
}

module.exports = { initializeDatabase }
