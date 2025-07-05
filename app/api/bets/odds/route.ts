import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const chainFrom = searchParams.get("chain_from")
    const chainTo = searchParams.get("chain_to")

    if (!chainFrom || !chainTo) {
      return NextResponse.json(
        {
          success: false,
          error: "chain_from and chain_to parameters are required",
        },
        { status: 400 },
      )
    }

    // Generate mock odds based on chain pair
    const seed = chainFrom.charCodeAt(0) + chainTo.charCodeAt(0)
    const baseInflowOdds = 1.5 + (Math.sin(seed) + 1) * 1.5
    const baseOutflowOdds = 1.5 + (Math.cos(seed) + 1) * 1.5

    // Add some randomness
    const inflowOdds = baseInflowOdds + (Math.random() - 0.5) * 0.5
    const outflowOdds = baseOutflowOdds + (Math.random() - 0.5) * 0.5

    return NextResponse.json({
      success: true,
      data: {
        chain_from: chainFrom,
        chain_to: chainTo,
        inflow_odds: Math.round(Math.max(1.1, inflowOdds) * 100) / 100,
        outflow_odds: Math.round(Math.max(1.1, outflowOdds) * 100) / 100,
        recent_stats: {
          avg_amount: Math.random() * 1000000,
          inflow_count: Math.floor(Math.random() * 20),
          outflow_count: Math.floor(Math.random() * 20),
        },
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to calculate odds",
      },
      { status: 500 },
    )
  }
}
