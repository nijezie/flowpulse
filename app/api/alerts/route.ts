import { NextResponse } from "next/server"

const mockAlerts = [
  {
    id: 1,
    chain_from: "ethereum",
    chain_to: "polygon",
    threshold_amount: 1000000,
    alert_type: "inflow",
    is_active: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    triggered_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 2,
    chain_from: "solana",
    chain_to: "ethereum",
    threshold_amount: 500000,
    alert_type: "outflow",
    is_active: true,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    triggered_at: null,
  },
]

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: mockAlerts,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch alerts",
      },
      { status: 500 },
    )
  }
}
