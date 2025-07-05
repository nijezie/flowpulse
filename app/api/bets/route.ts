import { NextResponse } from "next/server"

// Mock bets data
const mockBets = [
  {
    id: 1,
    user_id: "demo_user",
    chain_from: "ethereum",
    chain_to: "polygon",
    direction: "inflow",
    amount: 50,
    odds: 2.1,
    potential_payout: 105,
    status: "pending",
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 2,
    user_id: "demo_user",
    chain_from: "solana",
    chain_to: "ethereum",
    direction: "outflow",
    amount: 25,
    odds: 1.8,
    potential_payout: 45,
    status: "won",
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 3,
    user_id: "demo_user",
    chain_from: "arbitrum",
    chain_to: "optimism",
    direction: "inflow",
    amount: 100,
    odds: 2.5,
    potential_payout: 250,
    status: "lost",
    created_at: new Date(Date.now() - 10800000).toISOString(),
  },
]

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: mockBets,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch bets",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { user_id, chain_from, chain_to, direction, amount } = body

    if (!user_id || !chain_from || !chain_to || !direction || !amount) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 },
      )
    }

    // Calculate mock odds
    const odds = 1.5 + Math.random() * 2.5
    const potential_payout = amount * odds

    const newBet = {
      id: mockBets.length + 1,
      user_id,
      chain_from,
      chain_to,
      direction,
      amount: Number.parseFloat(amount),
      odds: Math.round(odds * 100) / 100,
      potential_payout: Math.round(potential_payout * 100) / 100,
      status: "pending",
      created_at: new Date().toISOString(),
    }

    mockBets.push(newBet)

    return NextResponse.json({
      success: true,
      data: newBet,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to place bet",
      },
      { status: 500 },
    )
  }
}
