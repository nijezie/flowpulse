import { NextResponse } from "next/server"

const CHAINS = ["ethereum", "polygon", "arbitrum", "optimism", "solana", "bsc"]
const INTERVALS = ["1m", "5m", "15m"]

export async function GET() {
  try {
    const heatmapData = []

    CHAINS.forEach((chainFrom) => {
      CHAINS.forEach((chainTo) => {
        if (chainFrom !== chainTo) {
          INTERVALS.forEach((interval) => {
            const seed = chainFrom.charCodeAt(0) + chainTo.charCodeAt(0)
            const baseAmount = Math.sin(seed) * 2000000
            const variation = (Math.random() - 0.5) * 1000000
            const amount = baseAmount + variation

            heatmapData.push({
              chain_from: chainFrom,
              chain_to: chainTo,
              interval_type: interval,
              net_amount: Math.round(amount),
              transaction_count: Math.floor(Math.random() * 15) + 1,
            })
          })
        }
      })
    })

    return NextResponse.json({
      success: true,
      data: heatmapData,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch heatmap data",
      },
      { status: 500 },
    )
  }
}
