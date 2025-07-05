import { NextResponse } from "next/server"

// Mock alerts data
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
  {
    id: 3,
    chain_from: "arbitrum",
    chain_to: "optimism",
    threshold_amount: 750000,
    alert_type: "inflow",
    is_active: false,
    created_at: new Date(Date.now() - 259200000).toISOString(),
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

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { chain_from, chain_to, threshold_amount, alert_type } = body

    if (!chain_from || !chain_to || !threshold_amount || !alert_type) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 },
      )
    }

    const newAlert = {
      id: mockAlerts.length + 1,
      chain_from,
      chain_to,
      threshold_amount: Number.parseFloat(threshold_amount),
      alert_type,
      is_active: true,
      created_at: new Date().toISOString(),
      triggered_at: null,
    }

    mockAlerts.push(newAlert)

    return NextResponse.json({
      success: true,
      data: newAlert,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create alert",
      },
      { status: 500 },
    )
  }
}
