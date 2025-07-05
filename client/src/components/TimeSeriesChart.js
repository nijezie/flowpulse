"use client"

import { useState, useEffect } from "react"
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"
import "./TimeSeriesChart.css"

const TimeSeriesChart = ({ selectedFlow }) => {
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(false)
  const [timeRange, setTimeRange] = useState("24")

  useEffect(() => {
    if (selectedFlow) {
      fetchTimeSeriesData()
    }
  }, [selectedFlow, timeRange])

  const fetchTimeSeriesData = async () => {
    if (!selectedFlow) return

    setLoading(true)
    try {
      const response = await fetch(
        `/api/flows/timeseries?chain_from=${selectedFlow.chain_from}&chain_to=${selectedFlow.chain_to}&hours=${timeRange}`,
      )
      const data = await response.json()

      if (data.success) {
        // Process data for chart
        const processedData = data.data.map((item) => ({
          time: new Date(item.time_bucket).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          timestamp: new Date(item.time_bucket),
          net_amount: Number.parseFloat(item.net_amount),
          transaction_count: Number.parseInt(item.transaction_count),
          inflow: Math.max(0, Number.parseFloat(item.net_amount)),
          outflow: Math.abs(Math.min(0, Number.parseFloat(item.net_amount))),
        }))

        setChartData(processedData)
      }
      setLoading(false)
    } catch (error) {
      console.error("Error fetching timeseries data:", error)
      setLoading(false)
    }
  }

  const formatAmount = (value) => {
    if (Math.abs(value) >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    }
    if (Math.abs(value) >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`
    }
    return `$${value.toFixed(0)}`
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{`Time: ${label}`}</p>
          <p className="tooltip-value positive">{`Inflow: ${formatAmount(data.inflow)}`}</p>
          <p className="tooltip-value negative">{`Outflow: ${formatAmount(data.outflow)}`}</p>
          <p className="tooltip-value neutral">{`Net: ${formatAmount(data.net_amount)}`}</p>
          <p className="tooltip-count">{`Transactions: ${data.transaction_count}`}</p>
        </div>
      )
    }
    return null
  }

  if (!selectedFlow) {
    return (
      <div className="chart-placeholder">
        <div className="placeholder-content">
          <h3>Select a Flow to View Trends</h3>
          <p>Click on a heatmap cell or narrative feed item to see detailed flow trends over time.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="timeseries-chart">
      <div className="chart-header">
        <div className="chart-title">
          <h3>
            {selectedFlow.chain_from.charAt(0).toUpperCase() + selectedFlow.chain_from.slice(1)} →{" "}
            {selectedFlow.chain_to.charAt(0).toUpperCase() + selectedFlow.chain_to.slice(1)}
          </h3>
          <p className="chart-subtitle">
            Current Net Flow:{" "}
            <span className={selectedFlow.net_amount >= 0 ? "positive" : "negative"}>
              {formatAmount(selectedFlow.net_amount)}
            </span>
          </p>
        </div>

        <div className="time-range-selector">
          {["1", "6", "24", "168"].map((hours) => (
            <button
              key={hours}
              className={`time-btn ${timeRange === hours ? "active" : ""}`}
              onClick={() => setTimeRange(hours)}
            >
              {hours === "168" ? "7D" : hours === "24" ? "24H" : hours === "6" ? "6H" : "1H"}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-container">
        {loading ? (
          <div className="chart-loading">
            <p>Loading chart data...</p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="chart-empty">
            <p>No data available for this time range</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="inflowGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="outflowGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ff4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="time" stroke="#888" fontSize={12} interval="preserveStartEnd" />
              <YAxis stroke="#888" fontSize={12} tickFormatter={formatAmount} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="inflow"
                stackId="1"
                stroke="#00ff88"
                fill="url(#inflowGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="outflow"
                stackId="2"
                stroke="#ff4444"
                fill="url(#outflowGradient)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="net_amount"
                stroke="#fff"
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 5"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="chart-stats">
        <div className="stat-item">
          <span className="stat-label">Avg Inflow</span>
          <span className="stat-value positive">
            {formatAmount(chartData.reduce((sum, item) => sum + item.inflow, 0) / (chartData.length || 1))}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Avg Outflow</span>
          <span className="stat-value negative">
            {formatAmount(chartData.reduce((sum, item) => sum + item.outflow, 0) / (chartData.length || 1))}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total Txns</span>
          <span className="stat-value">{chartData.reduce((sum, item) => sum + item.transaction_count, 0)}</span>
        </div>
      </div>
    </div>
  )
}

export default TimeSeriesChart
