"use client"

import { useState, useEffect } from "react"

const CHAINS = ["ethereum", "polygon", "arbitrum", "optimism", "solana", "bsc"]
const INTERVALS = ["1m", "5m", "15m"]

interface HeatmapGridProps {
  onFlowSelect: (flow: any) => void
}

const HeatmapGrid = ({ onFlowSelect }: HeatmapGridProps) => {
  const [selectedInterval, setSelectedInterval] = useState("1m")
  const [heatmapData, setHeatmapData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHeatmapData()
    const interval = setInterval(fetchHeatmapData, 30000)
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

  const getFlowValue = (chainFrom: string, chainTo: string, interval: string) => {
    const flow = heatmapData.find(
      (f) => f.chain_from === chainFrom && f.chain_to === chainTo && f.interval_type === interval,
    )
    return flow ? Number.parseFloat(flow.net_amount) : 0
  }

  const getIntensityClass = (value: number) => {
    const absValue = Math.abs(value)
    if (absValue === 0) return "bg-gray-700 text-gray-400"
    if (absValue < 100000) return value > 0 ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"
    if (absValue < 1000000) return value > 0 ? "bg-green-700 text-green-100" : "bg-red-700 text-red-100"
    return value > 0 ? "bg-green-500 text-black" : "bg-red-500 text-white"
  }

  const formatValue = (value: number) => {
    if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(1)}K`
    return value.toFixed(0)
  }

  const handleCellClick = (chainFrom: string, chainTo: string, value: number) => {
    onFlowSelect({
      chain_from: chainFrom,
      chain_to: chainTo,
      net_amount: value,
      interval_type: selectedInterval,
    })
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-400">Loading heatmap data...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center space-x-2">
        {INTERVALS.map((interval) => (
          <button
            key={interval}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              selectedInterval === interval ? "bg-green-500 text-black" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
            onClick={() => setSelectedInterval(interval)}
          >
            {interval}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="grid grid-cols-7 gap-1 text-xs">
            <div className="p-2 font-semibold text-gray-400">From \ To</div>
            {CHAINS.map((chain) => (
              <div key={chain} className="p-2 font-semibold text-gray-400 text-center capitalize">
                {chain.slice(0, 4)}
              </div>
            ))}

            {CHAINS.map((chainFrom) => (
              <>
                <div key={`${chainFrom}-header`} className="p-2 font-semibold text-gray-400 capitalize">
                  {chainFrom.slice(0, 4)}
                </div>
                {CHAINS.map((chainTo) => {
                  if (chainFrom === chainTo) {
                    return (
                      <div key={`${chainFrom}-${chainTo}`} className="p-2 bg-gray-800 text-gray-500 text-center">
                        -
                      </div>
                    )
                  }

                  const value = getFlowValue(chainFrom, chainTo, selectedInterval)
                  const intensityClass = getIntensityClass(value)

                  return (
                    <div
                      key={`${chainFrom}-${chainTo}`}
                      className={`p-2 text-center cursor-pointer hover:scale-105 transition-transform ${intensityClass}`}
                      onClick={() => handleCellClick(chainFrom, chainTo, value)}
                      title={`${chainFrom} → ${chainTo}: $${formatValue(value)}`}
                    >
                      {formatValue(value)}
                    </div>
                  )
                })}
              </>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-center space-x-4 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-500"></div>
          <span className="text-gray-400">High Inflow</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-gray-700"></div>
          <span className="text-gray-400">Neutral</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-red-500"></div>
          <span className="text-gray-400">High Outflow</span>
        </div>
      </div>
    </div>
  )
}

export default HeatmapGrid
