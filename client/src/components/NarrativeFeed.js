"use client"

import { useState, useEffect } from "react"
import "./NarrativeFeed.css"

const NarrativeFeed = ({ flows, onFlowSelect }) => {
  const [feedItems, setFeedItems] = useState([])

  useEffect(() => {
    // Convert flows to narrative feed items
    const narrativeItems = flows.map((flow) => ({
      id: `${flow.chain_from}-${flow.chain_to}-${Date.now()}`,
      timestamp: new Date(flow.latest_timestamp || Date.now()),
      chain_from: flow.chain_from,
      chain_to: flow.chain_to,
      coin: flow.coin,
      net_amount: Number.parseFloat(flow.net_amount),
      transaction_count: Number.parseInt(flow.transaction_count),
      type: Number.parseFloat(flow.net_amount) > 0 ? "inflow" : "outflow",
    }))

    // Sort by timestamp (newest first)
    narrativeItems.sort((a, b) => b.timestamp - a.timestamp)

    setFeedItems(narrativeItems.slice(0, 20)) // Show only latest 20 items
  }, [flows])

  const formatAmount = (amount) => {
    const absAmount = Math.abs(amount)
    if (absAmount >= 1000000) {
      return `$${(absAmount / 1000000).toFixed(2)}M`
    }
    if (absAmount >= 1000) {
      return `$${(absAmount / 1000).toFixed(1)}K`
    }
    return `$${absAmount.toFixed(0)}`
  }

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return timestamp.toLocaleDateString()
  }

  const generateNarrative = (item) => {
    const direction = item.type === "inflow" ? "flowed into" : "flowed out of"
    const chainFrom = item.chain_from.charAt(0).toUpperCase() + item.chain_from.slice(1)
    const chainTo = item.chain_to.charAt(0).toUpperCase() + item.chain_to.slice(1)

    return `${formatAmount(item.net_amount)} ${item.coin} ${direction} ${chainTo} from ${chainFrom}`
  }

  const generateMiniSparkline = (item) => {
    // Generate a simple sparkline based on the flow data
    const points = []
    const baseValue = Math.abs(item.net_amount)

    // Create 8 data points with some variation
    for (let i = 0; i < 8; i++) {
      const variation = (Math.random() - 0.5) * 0.3
      const value = baseValue * (1 + variation)
      points.push(value)
    }

    const max = Math.max(...points)
    const min = Math.min(...points)
    const range = max - min || 1

    // Convert to SVG path
    const pathData = points
      .map((point, index) => {
        const x = (index / (points.length - 1)) * 60
        const y = 20 - ((point - min) / range) * 15
        return `${index === 0 ? "M" : "L"} ${x} ${y}`
      })
      .join(" ")

    return (
      <svg width="60" height="20" className="mini-sparkline">
        <path d={pathData} stroke={item.type === "inflow" ? "#00ff88" : "#ff4444"} strokeWidth="1.5" fill="none" />
      </svg>
    )
  }

  const handleItemClick = (item) => {
    onFlowSelect({
      chain_from: item.chain_from,
      chain_to: item.chain_to,
      net_amount: item.net_amount,
      interval_type: "1m",
    })
  }

  return (
    <div className="narrative-feed">
      <div className="feed-header">
        <span className="feed-title">Live Flow Activity</span>
        <span className="feed-count">{feedItems.length} recent flows</span>
      </div>

      <div className="feed-list">
        {feedItems.length === 0 ? (
          <div className="feed-empty">
            <p>No recent flow data available</p>
            <p className="feed-empty-subtitle">Waiting for new transactions...</p>
          </div>
        ) : (
          feedItems.map((item) => (
            <div key={item.id} className={`feed-item ${item.type}`} onClick={() => handleItemClick(item)}>
              <div className="feed-item-header">
                <div className="flow-indicator">
                  <div className={`flow-dot ${item.type}`}></div>
                  <span className="flow-direction">
                    {item.chain_from} → {item.chain_to}
                  </span>
                </div>
                <div className="feed-timestamp">{formatTimeAgo(item.timestamp)}</div>
              </div>

              <div className="feed-item-content">
                <div className="narrative-text">{generateNarrative(item)}</div>
                <div className="feed-item-meta">
                  <span className="transaction-count">{item.transaction_count} txns</span>
                  <div className="sparkline-container">{generateMiniSparkline(item)}</div>
                </div>
              </div>

              <div className="feed-item-amount">
                <span className={`amount ${item.type}`}>
                  {item.type === "inflow" ? "+" : "-"}
                  {formatAmount(item.net_amount)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {feedItems.length > 0 && (
        <div className="feed-footer">
          <button className="load-more-btn">Load More History</button>
        </div>
      )}
    </div>
  )
}

export default NarrativeFeed
