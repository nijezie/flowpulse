import { NextResponse } from "next/server"

const CHAINS = ["ethereum", "polygon", "arbitrum", "optimism", "solana", "bsc"]
const STABLECOINS = ["USDC", "USDT", "DAI", "BUSD"]

function generateMockFlows() {
  const flows = []
  const now = new Date()

  for (let i = 0; i < 20; i++) {
    const chainFrom = CHAINS[Math.floor(Math.random() * CHAINS.length)]
    let chainTo = CHAINS[Math.floor(Math.random() * CHAINS.length)]

    while (chainTo === chainFrom) {
      chainTo = CHAINS[Math.floor(Math.random() * CHAINS.length)]
    }

    const coin = STABLECOINS[Math.floor(Math.random() * STABLECOINS.length)]
    const amount = (Math.random() * 5000000 + 100000) * (Math.random() > 0.6 ? 1 : -1)

    flows.push({
      chain_from: chainFrom,
      chain_to: chainTo,
      coin,
      net_amount: Math.round(amount),
      transaction_count: Math.floor(Math.random() * 20) + 1,
      latest_timestamp: new Date(now.getTime() - Math.random() * 3600000).toISOString(),
    })
  }

  return flows
}

export async function GET() {
  try {
    const flows = generateMockFlows()

    return NextResponse.json({
      success: true,
      data: flows,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch flows",
      },
      { status: 500 },
    )
  }
}
