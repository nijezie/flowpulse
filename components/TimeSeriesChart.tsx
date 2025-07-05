"use client"

import { useState, useEffect } from "react"
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"

const TimeSeriesChart = ({ selectedFlow }) => {
  const [chartData, setChartData] = useState([])
  const [timeRange, setTimeRange] = useState("24")

  useEffect(() => {
    if (selectedFlow) {
      // Generate mock time series data
      const data = []
      const now = new Date()
      const hours = Number.parseInt(timeRange)

      for (let i = hours; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000)
        const baseAmount = selectedFlow.net_amount || 0
        const variation = (Math.random() - 0.5) * Math.abs(baseAmount) * 0.3
        const amount = baseAmount + variation

        data.push({
          time: time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          timestamp: time,
          net_amount: amount,
          transaction_count: Math.floor(Math.random() * 20) + 1,
          inflow: Math.max(0, amount),
          outflow: Math.abs(Math.min(0, amount)),
        })
      }

      setChartData(data)
    }
  }, [selectedFlow, timeRange])

  const formatAmount = (value) => {
    if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(1)}K`
    return `$${value.toFixed(0)}`
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3">
          <p className="text-gray-300 text-sm">{`Time: ${label}`}</p>
          <p className="text-green-400 text-sm">{`Inflow: ${formatAmount(data.inflow)}`}</p>
          <p className="text-red-400 text-sm">{`Outflow: ${formatAmount(data.outflow)}`}</p>
          <p className="text-white text-sm">{`Net: ${formatAmount(data.net_amount)}`}</p>
          <p className="text-gray-400 text-xs">{`Transactions: ${data.transaction_count}`}</p>
        </div>
      )
    }
    return null
  }

  if (!selectedFlow) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-900 rounded-lg border-2 border-dashed border-gray-600">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-300 mb-2">Select a Flow to View Trends</h3>
          <p className="text-gray-500">Click on a heatmap cell or narrative feed item to see detailed flow trends.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">
            {selectedFlow.chain_from?.charAt(0).toUpperCase() + selectedFlow.chain_from?.slice(1)} →{" "}
            {selectedFlow.chain_to?.charAt(0).toUpperCase() + selectedFlow.chain_to?.slice(1)}
          </h3>
          <p className="text-sm text-gray-400">
            Current Net Flow:{" "}
            <span className={selectedFlow.net_amount >= 0 ? "text-green-400" : "text-red-400"}>
              {formatAmount(selectedFlow.net_amount)}
            </span>
          </p>
        </div>

        <div className="flex space-x-1">
          {["1", "6", "24", "168"].map((hours) => (
            <button
              key={hours}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                timeRange === hours ? "bg-green-500 text-black" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
              onClick={() => setTimeRange(hours)}
            >
              {hours === "168" ? "7D" : hours === "24" ? "24H" : hours === "6" ? "6H" : "1H"}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 bg-gray-900 rounded-lg p-4">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">Loading chart data...</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="inflowGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="outflowGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={formatAmount} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="inflow"
                stackId="1"
                stroke="#10b981"
                fill="url(#inflowGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="outflow"
                stackId="2"
                stroke="#ef4444"
                fill="url(#outflowGradient)"
                strokeWidth={2}
              />
              <Line type="monotone" dataKey="net_amount" stroke="#ffffff" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-sm text-gray-400">Avg Inflow</div>
          <div className="text-lg font-semibold text-green-400">
            {formatAmount(chartData.reduce((sum, item) => sum + item.inflow, 0) / (chartData.length || 1))}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-400">Avg Outflow</div>
          <div className="text-lg font-semibold text-red-400">
            {formatAmount(chartData.reduce((sum, item) => sum + item.outflow, 0) / (chartData.length || 1))}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-400">Total Txns</div>
          <div className="text-lg font-semibold text-white">
            {chartData.reduce((sum, item) => sum + item.transaction_count, 0)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TimeSeriesChart
