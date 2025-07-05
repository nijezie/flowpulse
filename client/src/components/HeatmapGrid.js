"use client"

import { useState, useEffect } from "react"
import "./HeatmapGrid.css"

const CHAINS = ["ethereum", "polygon", "arbitrum", "optimism", "solana", "bsc"]
const INTERVALS = ["1m", "5m", "15m"]

const HeatmapGrid = ({ onFlowSelect }) => {
  const [heatmapData, setHeatmapData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedInterval, setSelectedInterval] = useState("1m")

  useEffect(() => {
    fetchHeatmapData()
    const interval = setInterval(fetchHeatmapData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchHeatmapData = async () => {
    try {
      const response = await fetch("/api/flows/heatmap")
      const data = await response.json()
      if (data.success) {
        setHeatmapData(data.data)
      }
      setLoading(false)
    } catch (error) {
      console.error("Error fetching heatmap data:", error)
      setLoading(false)
    }
  }

  const getFlowValue = (chainFrom, chainTo, interval) => {
    const flow = heatmapData.find(
      (f) => f.chain_from === chainFrom && f.chain_to === chainTo && f.interval_type === interval,
    )
    return flow ? Number.parseFloat(flow.net_amount) : 0
  }

  const getIntensityClass = (value) => {
    const absValue = Math.abs(value)
    if (absValue === 0) return "neutral"
    if (absValue < 100000) return value > 0 ? "inflow-low" : "outflow-low"
    if (absValue < 1000000) return value > 0 ? "inflow-medium" : "outflow-medium"
    return value > 0 ? "inflow-high" : "outflow-high"
  }

  const formatValue = (value) => {
    if (Math.abs(value) >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    }
    if (Math.abs(value) >= 1000) {
      return `${(value / 1000).toFixed(1)}K`
    }
    return value.toFixed(0)
  }

  const handleCellClick = (chainFrom, chainTo, value) => {
    onFlowSelect({
      chain_from: chainFrom,
      chain_to: chainTo,
      net_amount: value,
      interval_type: selectedInterval,
    })
  }

  if (loading) {
    return <div className="loading">Loading heatmap data...</div>
  }

  return (
    <div className="heatmap-grid">
      <div className="interval-selector">
        {INTERVALS.map((interval) => (
          <button
            key={interval}
            className={`interval-btn ${selectedInterval === interval ? "active" : ""}`}
            onClick={() => setSelectedInterval(interval)}
          >
            {interval}
          </button>
        ))}
      </div>

      <div className="heatmap-table">
        <div className="heatmap-header">
          <div className="corner-cell">From \ To</div>
          {CHAINS.map((chain) => (
            <div key={chain} className="header-cell">
              {chain.charAt(0).toUpperCase() + chain.slice(1)}
            </div>
          ))}
        </div>

        {CHAINS.map((chainFrom) => (
          <div key={chainFrom} className="heatmap-row">
            <div className="row-header">{chainFrom.charAt(0).toUpperCase() + chainFrom.slice(1)}</div>
            {CHAINS.map((chainTo) => {
              if (chainFrom === chainTo) {
                return (
                  <div key={chainTo} className="heatmap-cell disabled">
                    -
                  </div>
                )
              }

              const value = getFlowValue(chainFrom, chainTo, selectedInterval)
              const intensityClass = getIntensityClass(value)

              return (
                <div
                  key={chainTo}
                  className={`heatmap-cell ${intensityClass}`}
                  onClick={() => handleCellClick(chainFrom, chainTo, value)}
                  title={`${chainFrom} → ${chainTo}: $${formatValue(value)}`}
                >
                  <div className="cell-value">{formatValue(value)}</div>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      <div className="heatmap-legend">
        <div className="legend-item">
          <div className="legend-color inflow-high"></div>
          <span>High Inflow</span>
        </div>
        <div className="legend-item">
          <div className="legend-color inflow-medium"></div>
          <span>Medium Inflow</span>
        </div>
        <div className="legend-item">
          <div className="legend-color neutral"></div>
          <span>Neutral</span>
        </div>
        <div className="legend-item">
          <div className="legend-color outflow-medium"></div>
          <span>Medium Outflow</span>
        </div>
        <div className="legend-item">
          <div className="legend-color outflow-high"></div>
          <span>High Outflow</span>
        </div>
      </div>
    </div>
  )
}

export default HeatmapGrid
