import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const chainFrom = searchParams.get("chain_from")
    const chainTo = searchParams.get("chain_to")
    const hours = Number.parseInt(searchParams.get("hours") || "24")

    if (!chainFrom || !chainTo) {
      return NextResponse.json(
        {
          success: false,
          error: "chain_from and chain_to parameters are required",
        },
        { status: 400 },
      )
    }

    // Generate mock time series data
    const data = []
    const now = new Date()
    const seed = chainFrom.charCodeAt(0) + chainTo.charCodeAt(0)
    const baseAmount = Math.sin(seed) * 1000000

    for (let i = hours; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000)
      const variation = (Math.random() - 0.5) * Math.abs(baseAmount) * 0.3
      const amount = baseAmount + variation

      data.push({
        time_bucket: time.toISOString(),
        net_amount: Math.round(amount),
        transaction_count: Math.floor(Math.random() * 20) + 1,
      })
    }

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch timeseries data",
      },
      { status: 500 },
    )
  }
}
