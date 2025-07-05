"use client"

import { useState, useEffect } from "react"
import "./StatsPanel.css"

const StatsPanel = () => {
  const [stats, setStats] = useState({
    totalVolume24h: 0,
    totalTransactions: 0,
    activeChains: 0,
    topFlow: null,
    recentAlerts: 0,
    activeBets: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      // Fetch multiple endpoints for comprehensive stats
      const [flowsRes, alertsRes, betsRes] = await Promise.all([
        fetch("/api/flows?limit=1000"),
        fetch("/api/alerts"),
        fetch("/api/bets"),
      ])

      const [flowsData, alertsData, betsData] = await Promise.all([flowsRes.json(), alertsRes.json(), betsRes.json()])

      if (flowsData.success && alertsData.success && betsData.success) {
        const flows = flowsData.data
        const alerts = alertsData.data
        const bets = betsData.data

        // Calculate stats
        const totalVolume = flows.reduce((sum, flow) => sum + Math.abs(Number.parseFloat(flow.net_amount)), 0)

        const totalTransactions = flows.reduce((sum, flow) => sum + Number.parseInt(flow.transaction_count), 0)

        const activeChains = new Set([...flows.map((f) => f.chain_from), ...flows.map((f) => f.chain_to)]).size

        const topFlow = flows.reduce(
          (max, flow) =>
            Math.abs(Number.parseFloat(flow.net_amount)) > Math.abs(Number.parseFloat(max?.net_amount || 0))
              ? flow
              : max,
          null,
        )

        const recentAlerts = alerts.filter(
          (alert) => alert.triggered_at && new Date(alert.triggered_at) > new Date(Date.now() - 24 * 60 * 60 * 1000),
        ).length

        const activeBets = bets.filter((bet) => bet.status === "pending").length

        setStats({
          totalVolume24h: totalVolume,
          totalTransactions,
          activeChains,
          topFlow,
          recentAlerts,
          activeBets,
        })
      }
      setLoading(false)
    } catch (error) {
      console.error("Error fetching stats:", error)
      setLoading(false)
    }
  }

  const formatVolume = (volume) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)}K`
    return `$${volume.toFixed(2)}`
  }

  const formatNumber = (num) => {
    return num.toLocaleString()
  }

  if (loading) {
    return (
      <div className="stats-panel loading">
        <div className="loading-text">Loading stats...</div>
      </div>
    )
  }

  return (
    <div className="stats-panel">
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-value">{formatVolume(stats.totalVolume24h)}</div>
            <div className="stat-label">24h Volume</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{formatNumber(stats.totalTransactions)}</div>
            <div className="stat-label">Transactions</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔗</div>
          <div className="stat-content">
            <div className="stat-value">{stats.activeChains}</div>
            <div className="stat-label">Active Chains</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🚨</div>
          <div className="stat-content">
            <div className="stat-value">{stats.recentAlerts}</div>
            <div className="stat-label">Recent Alerts</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎲</div>
          <div className="stat-content">
            <div className="stat-value">{stats.activeBets}</div>
            <div className="stat-label">Active Bets</div>
          </div>
        </div>

        {stats.topFlow && (
          <div className="stat-card highlight">
            <div className="stat-icon">🔥</div>
            <div className="stat-content">
              <div className="stat-value">{formatVolume(Math.abs(Number.parseFloat(stats.topFlow.net_amount)))}</div>
              <div className="stat-label">
                Top Flow: {stats.topFlow.chain_from} → {stats.topFlow.chain_to}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StatsPanel
