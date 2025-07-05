"use client"

import { useState, useEffect } from "react"
import { ArrowRight, TrendingUp, TrendingDown } from "lucide-react"

interface NarrativeFeedProps {
  flows: any[]
  onFlowSelect: (flow: any) => void
}

const NarrativeFeed = ({ flows, onFlowSelect }: NarrativeFeedProps) => {
  const [feedItems, setFeedItems] = useState<any[]>([])

  useEffect(() => {
    const narrativeItems = flows.map((flow, index) => ({
      id: `flow-${index}`,
      timestamp: new Date(flow.latest_timestamp),
      chain_from: flow.chain_from,
      chain_to: flow.chain_to,
      coin: flow.coin,
      net_amount: flow.net_amount,
      transaction_count: flow.transaction_count,
      type: flow.net_amount > 0 ? "inflow" : "outflow",
    }))

    setFeedItems(narrativeItems.slice(0, 10))
  }, [flows])

  const formatAmount = (amount: number) => {
    const absAmount = Math.abs(amount)
    if (absAmount >= 1000000) return `$${(absAmount / 1000000).toFixed(2)}M`
    if (absAmount >= 1000) return `$${(absAmount / 1000).toFixed(1)}K`
    return `$${absAmount.toFixed(0)}`
  }

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    return `${Math.floor(minutes / 60)}h ago`
  }

  const generateNarrative = (item: any) => {
    const direction = item.type === "inflow" ? "flowed into" : "flowed out of"
    const chainFrom = item.chain_from.charAt(0).toUpperCase() + item.chain_from.slice(1)
    const chainTo = item.chain_to.charAt(0).toUpperCase() + item.chain_to.slice(1)
    return `${formatAmount(item.net_amount)} ${item.coin} ${direction} ${chainTo} from ${chainFrom}`
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {feedItems.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          <p>No recent flow data available</p>
          <p className="text-sm mt-2">Waiting for new transactions...</p>
        </div>
      ) : (
        feedItems.map((item) => (
          <div
            key={item.id}
            className={`bg-gray-900 rounded-lg p-4 border-l-4 cursor-pointer hover:bg-gray-800 transition-colors ${
              item.type === "inflow" ? "border-green-400" : "border-red-400"
            }`}
            onClick={() => onFlowSelect(item)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {item.type === "inflow" ? (
                  <TrendingUp className="h-4 w-4 text-green-400" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-400" />
                )}
                <span className="text-sm text-gray-400 capitalize">
                  {item.chain_from} <ArrowRight className="h-3 w-3 inline mx-1" /> {item.chain_to}
                </span>
              </div>
              <span className="text-xs text-gray-500">{formatTimeAgo(item.timestamp)}</span>
            </div>

            <p className="text-sm text-gray-300 mb-2">{generateNarrative(item)}</p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{item.transaction_count} transactions</span>
              <span className={`font-semibold ${item.type === "inflow" ? "text-green-400" : "text-red-400"}`}>
                {item.type === "inflow" ? "+" : "-"}
                {formatAmount(item.net_amount)}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default NarrativeFeed
