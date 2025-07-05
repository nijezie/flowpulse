const { Pool } = require("pg")
const dotenv = require("dotenv")

dotenv.config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

const CHAINS = ["ethereum", "polygon", "arbitrum", "optimism", "solana", "bsc"]
const STABLECOINS = ["USDC", "USDT", "DAI", "BUSD"]
const INTERVALS = ["1m", "5m", "15m"]

const generateRealisticFlowData = (count = 1000) => {
  const flows = []
  const now = new Date()

  for (let i = 0; i < count; i++) {
    const chainFrom = CHAINS[Math.floor(Math.random() * CHAINS.length)]
    let chainTo = CHAINS[Math.floor(Math.random() * CHAINS.length)]

    // Ensure different chains
    while (chainTo === chainFrom) {
      chainTo = CHAINS[Math.floor(Math.random() * CHAINS.length)]
    }

    const coin = STABLECOINS[Math.floor(Math.random() * STABLECOINS.length)]
    const interval = INTERVALS[Math.floor(Math.random() * INTERVALS.length)]

    // Generate more realistic amounts based on chain pairs
    let baseAmount = 100000

    // Ethereum tends to have larger flows
    if (chainFrom === "ethereum" || chainTo === "ethereum") {
      baseAmount = 1000000
    }

    // Solana and BSC have medium flows
    if (chainFrom === "solana" || chainTo === "solana" || chainFrom === "bsc" || chainTo === "bsc") {
      baseAmount = 500000
    }

    // Add randomness and direction
    const amount = (baseAmount + Math.random() * baseAmount * 2) * (Math.random() > 0.6 ? 1 : -1) // 60% inflow, 40% outflow

    // Generate timestamp within last 7 days
    const timestamp = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000)

    flows.push({
      chain_from: chainFrom,
      chain_to: chainTo,
      coin,
      amount: Math.round(amount * 100) / 100, // Round to 2 decimal places
      interval_type: interval,
      timestamp,
      block_number: Math.floor(Math.random() * 1000000) + 15000000,
      transaction_hash: "0x" + Math.random().toString(16).substr(2, 64),
    })
  }

  return flows
}

const generateSampleUsers = () => {
  return [
    { user_id: "alice_trader", username: "Alice", balance: 2500.0 },
    { user_id: "bob_analyst", username: "Bob", balance: 1800.5 },
    { user_id: "charlie_whale", username: "Charlie", balance: 10000.0 },
    { user_id: "diana_degen", username: "Diana", balance: 750.25 },
    { user_id: "eve_hodler", username: "Eve", balance: 5000.0 },
  ]
}

const generateSampleBets = (users) => {
  const bets = []
  const now = new Date()

  users.forEach((user) => {
    // Generate 3-8 bets per user
    const betCount = Math.floor(Math.random() * 6) + 3

    for (let i = 0; i < betCount; i++) {
      const chainFrom = CHAINS[Math.floor(Math.random() * CHAINS.length)]
      let chainTo = CHAINS[Math.floor(Math.random() * CHAINS.length)]

      while (chainTo === chainFrom) {
        chainTo = CHAINS[Math.floor(Math.random() * CHAINS.length)]
      }

      const direction = Math.random() > 0.5 ? "inflow" : "outflow"
      const amount = [10, 25, 50, 100, 250, 500][Math.floor(Math.random() * 6)]
      const odds = 1.5 + Math.random() * 3 // Odds between 1.5 and 4.5
      const status = ["pending", "won", "lost"][Math.floor(Math.random() * 3)]

      const createdAt = new Date(now.getTime() - Math.random() * 3 * 24 * 60 * 60 * 1000)

      bets.push({
        user_id: user.user_id,
        chain_from: chainFrom,
        chain_to: chainTo,
        direction,
        amount,
        odds: Math.round(odds * 100) / 100,
        potential_payout: Math.round(amount * odds * 100) / 100,
        status,
        created_at: createdAt,
        resolved_at: status !== "pending" ? new Date(createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000) : null,
      })
    }
  })

  return bets
}

const seedDatabase = async () => {
  const client = await pool.connect()

  try {
    console.log("🌱 Starting database seeding...")

    // Clear existing data
    console.log("🧹 Clearing existing data...")
    await client.query("DELETE FROM bets")
    await client.query("DELETE FROM flows")
    await client.query("DELETE FROM users WHERE user_id != 'demo_user'")
    await client.query("DELETE FROM alerts WHERE id > 3") // Keep sample alerts

    // Generate and insert flows
    console.log("📊 Generating flow data...")
    const flows = generateRealisticFlowData(2000)

    for (const flow of flows) {
      await client.query(
        `
        INSERT INTO flows (chain_from, chain_to, coin, amount, interval_type, timestamp, block_number, transaction_hash)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
        [
          flow.chain_from,
          flow.chain_to,
          flow.coin,
          flow.amount,
          flow.interval_type,
          flow.timestamp,
          flow.block_number,
          flow.transaction_hash,
        ],
      )
    }

    // Generate and insert users
    console.log("👥 Creating sample users...")
    const users = generateSampleUsers()

    for (const user of users) {
      await client.query(
        `
        INSERT INTO users (user_id, username, balance)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id) DO UPDATE SET
          username = EXCLUDED.username,
          balance = EXCLUDED.balance
      `,
        [user.user_id, user.username, user.balance],
      )
    }

    // Generate and insert bets
    console.log("🎲 Creating sample bets...")
    const bets = generateSampleBets(users)

    for (const bet of bets) {
      await client.query(
        `
        INSERT INTO bets (user_id, chain_from, chain_to, direction, amount, odds, potential_payout, status, created_at, resolved_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `,
        [
          bet.user_id,
          bet.chain_from,
          bet.chain_to,
          bet.direction,
          bet.amount,
          bet.odds,
          bet.potential_payout,
          bet.status,
          bet.created_at,
          bet.resolved_at,
        ],
      )
    }

    // Create some additional alerts
    console.log("🚨 Creating additional alerts...")
    const additionalAlerts = [
      ["ethereum", "arbitrum", 2000000, "inflow"],
      ["polygon", "optimism", 750000, "outflow"],
      ["solana", "bsc", 1500000, "inflow"],
      ["arbitrum", "polygon", 1000000, "outflow"],
    ]

    for (const [from, to, threshold, type] of additionalAlerts) {
      await client.query(
        `
        INSERT INTO alerts (chain_from, chain_to, threshold_amount, alert_type)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT DO NOTHING
      `,
        [from, to, threshold, type],
      )
    }

    // Update statistics
    console.log("📈 Updating user statistics...")
    await client.query(`
      UPDATE users SET 
        total_bets = (
          SELECT COUNT(*) FROM bets WHERE bets.user_id = users.user_id
        ),
        total_winnings = (
          SELECT COALESCE(SUM(potential_payout), 0) 
          FROM bets 
          WHERE bets.user_id = users.user_id AND status = 'won'
        )
    `)

    console.log("✅ Database seeding completed successfully!")
    console.log(`📊 Inserted ${flows.length} flow records`)
    console.log(`👥 Created ${users.length} users`)
    console.log(`🎲 Created ${bets.length} bets`)
    console.log(`🚨 Total alerts: ${3 + additionalAlerts.length}`)
  } catch (error) {
    console.error("❌ Error seeding database:", error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

// Run seeding
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("🎉 Database seeding complete!")
      process.exit(0)
    })
    .catch((error) => {
      console.error("💥 Database seeding failed:", error)
      process.exit(1)
    })
}

module.exports = { seedDatabase }
