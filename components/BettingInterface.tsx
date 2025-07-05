"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react"

const PRESET_AMOUNTS = [10, 50, 100, 500]

interface BettingInterfaceProps {
  selectedFlow: any
}

const BettingInterface = ({ selectedFlow }: BettingInterfaceProps) => {
  const [betAmount, setBetAmount] = useState(10)
  const [betDirection, setBetDirection] = useState("inflow")
  const [odds, setOdds] = useState({ inflow_odds: 2.0, outflow_odds: 2.0 })
  const [userBets, setUserBets] = useState<any[]>([])

  useEffect(() => {
    // Mock odds calculation
    if (selectedFlow) {
      const inflowOdds = 1.5 + Math.random() * 2.5
      const outflowOdds = 1.5 + Math.random() * 2.5
      setOdds({
        inflow_odds: Math.round(inflowOdds * 100) / 100,
        outflow_odds: Math.round(outflowOdds * 100) / 100,
      })
    }

    // Mock user bets
    const mockBets = [
      {
        id: 1,
        chain_from: "ethereum",
        chain_to: "polygon",
        direction: "inflow",
        amount: 50,
        odds: 2.1,
        status: "pending",
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 2,
        chain_from: "solana",
        chain_to: "ethereum",
        direction: "outflow",
        amount: 25,
        odds: 1.8,
        status: "won",
        created_at: new Date(Date.now() - 7200000).toISOString(),
      },
    ]
    setUserBets(mockBets)
  }, [selectedFlow])

  const getCurrentOdds = () => {
    return betDirection === "inflow" ? odds.inflow_odds : odds.outflow_odds
  }

  const getPotentialPayout = () => {
    return betAmount * getCurrentOdds()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getBetStatusColor = (status: string) => {
    switch (status) {
      case "won":
        return "text-green-400"
      case "lost":
        return "text-red-400"
      default:
        return "text-yellow-400"
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
        <h4 className="text-lg font-semibold text-green-400 mb-4">Place Your Bet</h4>

        {selectedFlow ? (
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-sm text-gray-400 mb-1">Selected Flow</div>
              <div className="font-semibold text-white capitalize">
                {selectedFlow.chain_from} → {selectedFlow.chain_to}
              </div>
              <div className={`text-sm ${selectedFlow.net_amount >= 0 ? "text-green-400" : "text-red-400"}`}>
                Current: ${Math.abs(selectedFlow.net_amount).toLocaleString()}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Bet Direction</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-colors ${
                    betDirection === "inflow"
                      ? "bg-green-900 border-green-400 text-green-300"
                      : "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
                  }`}
                  onClick={() => setBetDirection("inflow")}
                >
                  <TrendingUp className="h-4 w-4" />
                  <div className="text-center">
                    <div>Inflow</div>
                    <div className="text-xs">{odds.inflow_odds.toFixed(2)}x</div>
                  </div>
                </button>
                <button
                  className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-colors ${
                    betDirection === "outflow"
                      ? "bg-red-900 border-red-400 text-red-300"
                      : "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
                  }`}
                  onClick={() => setBetDirection("outflow")}
                >
                  <TrendingDown className="h-4 w-4" />
                  <div className="text-center">
                    <div>Outflow</div>
                    <div className="text-xs">{odds.outflow_odds.toFixed(2)}x</div>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Bet Amount</label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {PRESET_AMOUNTS.map((amount) => (
                  <button
                    key={amount}
                    className={`p-2 rounded text-sm transition-colors ${
                      betAmount === amount ? "bg-green-500 text-black" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                    onClick={() => setBetAmount(amount)}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Number.parseFloat(e.target.value) || 0)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                min="1"
                max="10000"
              />
            </div>

            <div className="bg-gray-800 rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Bet Amount:</span>
                <span className="text-white">${betAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Odds:</span>
                <span className="text-white">{getCurrentOdds().toFixed(2)}x</span>
              </div>
              <div className="flex justify-between font-semibold border-t border-gray-700 pt-2">
                <span className="text-gray-300">Potential Payout:</span>
                <span className="text-green-400">${getPotentialPayout().toFixed(2)}</span>
              </div>
            </div>

            <button className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold py-3 rounded-lg transition-colors">
              Place {betDirection.charAt(0).toUpperCase() + betDirection.slice(1)} Bet
            </button>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-600" />
            <p>Select a flow from the heatmap or feed to place a bet</p>
          </div>
        )}
      </div>

      <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
        <h4 className="text-lg font-semibold text-white mb-4">Recent Bets</h4>
        {userBets.length === 0 ? (
          <div className="text-center py-4 text-gray-400">
            <p>No bets placed yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {userBets.map((bet) => (
              <div key={bet.id} className="bg-gray-800 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-300 capitalize">
                    {bet.chain_from} → {bet.chain_to}
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      bet.direction === "inflow" ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"
                    }`}
                  >
                    {bet.direction}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">
                    ${bet.amount} @ {bet.odds}x
                  </span>
                  <span className={getBetStatusColor(bet.status)}>{bet.status}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">{formatDate(bet.created_at)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default BettingInterface
