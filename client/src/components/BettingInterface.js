"use client"

import { useState, useEffect } from "react"
import "./BettingInterface.css"

const PRESET_AMOUNTS = [10, 50, 100, 500]

const BettingInterface = ({ selectedFlow }) => {
  const [betAmount, setBetAmount] = useState(10)
  const [betDirection, setBetDirection] = useState("inflow")
  const [odds, setOdds] = useState({ inflow_odds: 2.0, outflow_odds: 2.0 })
  const [loading, setLoading] = useState(false)
  const [userBets, setUserBets] = useState([])
  const [userId] = useState("user_" + Math.random().toString(36).substr(2, 9)) // Mock user ID

  useEffect(() => {
    if (selectedFlow) {
      fetchOdds()
    }
    fetchUserBets()
  }, [selectedFlow])

  const fetchOdds = async () => {
    if (!selectedFlow) return

    try {
      const response = await fetch(
        `/api/bets/odds?chain_from=${selectedFlow.chain_from}&chain_to=${selectedFlow.chain_to}`,
      )
      const data = await response.json()
      if (data.success) {
        setOdds(data.data)
      }
    } catch (error) {
      console.error("Error fetching odds:", error)
    }
  }

  const fetchUserBets = async () => {
    try {
      const response = await fetch(`/api/bets?user_id=${userId}`)
      const data = await response.json()
      if (data.success) {
        setUserBets(data.data.slice(0, 5)) // Show only latest 5 bets
      }
    } catch (error) {
      console.error("Error fetching user bets:", error)
    }
  }

  const handlePlaceBet = async () => {
    if (!selectedFlow) {
      alert("Please select a flow first")
      return
    }

    if (betAmount < 1) {
      alert("Minimum bet amount is $1")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/bets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          chain_from: selectedFlow.chain_from,
          chain_to: selectedFlow.chain_to,
          direction: betDirection,
          amount: betAmount,
        }),
      })

      const data = await response.json()
      if (data.success) {
        alert(`Bet placed successfully! Potential payout: $${data.data.potential_payout.toFixed(2)}`)
        fetchUserBets()
        // Reset form
        setBetAmount(10)
      } else {
        alert("Failed to place bet: " + data.error)
      }
    } catch (error) {
      console.error("Error placing bet:", error)
      alert("Failed to place bet")
    }
    setLoading(false)
  }

  const getCurrentOdds = () => {
    return betDirection === "inflow" ? odds.inflow_odds : odds.outflow_odds
  }

  const getPotentialPayout = () => {
    return betAmount * getCurrentOdds()
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  const getBetStatusColor = (status) => {
    switch (status) {
      case "won":
        return "positive"
      case "lost":
        return "negative"
      default:
        return "neutral"
    }
  }

  return (
    <div className="betting-interface">
      <div className="betting-form">
        <div className="bet-selection">
          <h4>Place Your Bet</h4>

          {selectedFlow ? (
            <div className="selected-flow">
              <div className="flow-info">
                <span className="flow-pair">
                  {selectedFlow.chain_from.charAt(0).toUpperCase() + selectedFlow.chain_from.slice(1)} →{" "}
                  {selectedFlow.chain_to.charAt(0).toUpperCase() + selectedFlow.chain_to.slice(1)}
                </span>
                <span className={`current-flow ${selectedFlow.net_amount >= 0 ? "positive" : "negative"}`}>
                  Current: ${Math.abs(selectedFlow.net_amount).toLocaleString()}
                </span>
              </div>
            </div>
          ) : (
            <div className="no-flow-selected">
              <p>Select a flow from the heatmap or feed to place a bet</p>
            </div>
          )}
        </div>

        {selectedFlow && (
          <>
            <div className="bet-direction">
              <label>Bet Direction</label>
              <div className="direction-buttons">
                <button
                  className={`direction-btn ${betDirection === "inflow" ? "active inflow" : ""}`}
                  onClick={() => setBetDirection("inflow")}
                >
                  Inflow
                  <span className="odds">{odds.inflow_odds.toFixed(2)}x</span>
                </button>
                <button
                  className={`direction-btn ${betDirection === "outflow" ? "active outflow" : ""}`}
                  onClick={() => setBetDirection("outflow")}
                >
                  Outflow
                  <span className="odds">{odds.outflow_odds.toFixed(2)}x</span>
                </button>
              </div>
            </div>

            <div className="bet-amount">
              <label>Bet Amount</label>
              <div className="amount-presets">
                {PRESET_AMOUNTS.map((amount) => (
                  <button
                    key={amount}
                    className={`preset-btn ${betAmount === amount ? "active" : ""}`}
                    onClick={() => setBetAmount(amount)}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
              <div className="custom-amount">
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number.parseFloat(e.target.value) || 0)}
                  min="1"
                  max="10000"
                  step="1"
                />
              </div>
            </div>

            <div className="bet-summary">
              <div className="summary-row">
                <span>Bet Amount:</span>
                <span>${betAmount.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Odds:</span>
                <span>{getCurrentOdds().toFixed(2)}x</span>
              </div>
              <div className="summary-row total">
                <span>Potential Payout:</span>
                <span className="positive">${getPotentialPayout().toFixed(2)}</span>
              </div>
            </div>

            <button className="place-bet-btn" onClick={handlePlaceBet} disabled={loading || betAmount < 1}>
              {loading ? "Placing Bet..." : `Place ${betDirection.charAt(0).toUpperCase() + betDirection.slice(1)} Bet`}
            </button>
          </>
        )}
      </div>

      <div className="recent-bets">
        <h4>Recent Bets</h4>
        {userBets.length === 0 ? (
          <div className="no-bets">
            <p>No bets placed yet</p>
          </div>
        ) : (
          <div className="bets-list">
            {userBets.map((bet) => (
              <div key={bet.id} className="bet-item">
                <div className="bet-info">
                  <div className="bet-flow">
                    <span className="flow-pair">
                      {bet.chain_from} → {bet.chain_to}
                    </span>
                    <span className={`bet-direction ${bet.direction}`}>{bet.direction}</span>
                  </div>
                  <div className="bet-details">
                    <span className="bet-amount">${bet.amount}</span>
                    <span className="bet-odds">{bet.odds}x</span>
                    <span className={`bet-status ${getBetStatusColor(bet.status)}`}>{bet.status}</span>
                  </div>
                </div>
                <div className="bet-meta">
                  <span className="bet-date">{formatDate(bet.created_at)}</span>
                  {bet.status === "won" && <span className="bet-payout positive">+${bet.potential_payout}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default BettingInterface
