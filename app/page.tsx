"use client"

import { useState, useEffect } from "react"
import { Activity, TrendingUp, AlertTriangle, DollarSign, Link, Dice6 } from "lucide-react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"

// Header Component
const Header = () => (
  <header className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
    <div className="max-w-7xl mx-auto px-6 py-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Activity className="h-8 w-8 text-green-400" />
            <h1 className="text-2xl font-bold text-white">FlowPulse</h1>
          </div>
          <span className="text-gray-400 text-sm hidden sm:block">Real-time Stablecoin Flow Dashboard</span>
        </div>
        <div className="flex items-center space-x-4 sm:space-x-8">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
            <div className="text-center">
              <div className="text-sm text-gray-400">24h Volume</div>
              <div className="text-lg font-semibold text-green-400">$2.4B</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 font-medium">Live</span>
          </div>
        </div>
      </div>
    </div>
  </header>
)

// Stats Panel Component
const StatsPanel = () => {
  const stats = [
    { icon: DollarSign, label: "24h Volume", value: "$2.4B", change: "+12.5%" },
    { icon: Activity, label: "Transactions", value: "15,847", change: "+8.2%" },
    { icon: Link, label: "Active Chains", value: "6", change: "stable" },
    { icon: AlertTriangle, label: "Recent Alerts", value: "3", change: "+2" },
    { icon: Dice6, label: "Active Bets", value: "127", change: "+15" },
    { icon: TrendingUp, label: "Top Flow", value: "ETH→POLY", change: "$2.2M" },
  ]

  return (
    <div className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className="bg-gray-900 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5 text-green-400" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-400 truncate">{stat.label}</div>
                    <div className="text-lg font-semibold text-white">{stat.value}</div>
                    <div className="text-xs text-green-400">{stat.change}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Heatmap Component
const HeatmapGrid = ({ onFlowSelect }: { onFlowSelect: (flow: any) => void }) => {
  const chains = ["ethereum", "polygon", "arbitrum", "optimism", "solana", "bsc"]
  const [selectedInterval, setSelectedInterval] = useState("1m")

  const getFlowValue = (from: string, to: string) => {
    const seed = from.charCodeAt(0) + to.charCodeAt(0)
    return Math.sin(seed) * 2000000 + (Math.random() - 0.5) * 1000000
  }

  const getIntensityClass = (value: number) => {
    const absValue = Math.abs(value)
    if (absValue < 100000) return value > 0 ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"
    if (absValue < 1000000) return value > 0 ? "bg-green-700 text-green-100" : "bg-red-700 text-red-100"
    return value > 0 ? "bg-green-500 text-black" : "bg-red-500 text-white"
  }

  const formatValue = (value: number) => {
    if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(1)}K`
    return value.toFixed(0)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center space-x-2">
        {["1m", "5m", "15m"].map((interval) => (
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
        <div className="grid grid-cols-7 gap-1 text-xs min-w-max">
          <div className="p-2 font-semibold text-gray-400">From \ To</div>
          {chains.map((chain) => (
            <div key={chain} className="p-2 font-semibold text-gray-400 text-center capitalize">
              {chain.slice(0, 4)}
            </div>
          ))}

          {chains.map((chainFrom) => (
            <>
              <div key={`${chainFrom}-header`} className="p-2 font-semibold text-gray-400 capitalize">
                {chainFrom.slice(0, 4)}
              </div>
              {chains.map((chainTo) => {
                if (chainFrom === chainTo) {
                  return (
                    <div key={`${chainFrom}-${chainTo}`} className="p-2 bg-gray-800 text-gray-500 text-center">
                      -
                    </div>
                  )
                }

                const value = getFlowValue(chainFrom, chainTo)
                const intensityClass = getIntensityClass(value)

                return (
                  <div
                    key={`${chainFrom}-${chainTo}`}
                    className={`p-2 text-center cursor-pointer hover:scale-105 transition-transform ${intensityClass}`}
                    onClick={() => onFlowSelect({ chain_from: chainFrom, chain_to: chainTo, net_amount: value })}
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

// Chart Component
const FlowChart = ({ selectedFlow }: { selectedFlow: any }) => {
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    if (selectedFlow) {
      const data = []
      for (let i = 24; i >= 0; i--) {
        const time = new Date(Date.now() - i * 60 * 60 * 1000)
        const baseAmount = selectedFlow.net_amount || 0
        const variation = (Math.random() - 0.5) * Math.abs(baseAmount) * 0.3
        data.push({
          time: time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          amount: baseAmount + variation,
        })
      }
      setChartData(data)
    }
  }, [selectedFlow])

  if (!selectedFlow) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-900 rounded-lg border-2 border-dashed border-gray-600">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-300 mb-2">Select a Flow to View Trends</h3>
          <p className="text-gray-500">Click on a heatmap cell to see detailed flow trends.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white capitalize">
          {selectedFlow.chain_from} → {selectedFlow.chain_to}
        </h3>
        <p className="text-sm text-gray-400">
          Current Net Flow:{" "}
          <span className={selectedFlow.net_amount >= 0 ? "text-green-400" : "text-red-400"}>
            ${Math.abs(selectedFlow.net_amount).toLocaleString()}
          </span>
        </p>
      </div>

      <div className="h-64 bg-gray-900 rounded-lg p-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }}
              labelStyle={{ color: "#d1d5db" }}
            />
            <Area type="monotone" dataKey="amount" stroke="#10b981" fill="url(#gradient)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// Live Feed Component
const LiveFeed = ({ onFlowSelect }: { onFlowSelect: (flow: any) => void }) => {
  const [feeds, setFeeds] = useState<any[]>([])

  useEffect(() => {
    const generateFeed = () => {
      const chains = ["ethereum", "polygon", "arbitrum", "optimism", "solana", "bsc"]
      const coins = ["USDC", "USDT", "DAI"]

      return Array.from({ length: 8 }, (_, i) => ({
        id: i,
        chain_from: chains[Math.floor(Math.random() * chains.length)],
        chain_to: chains[Math.floor(Math.random() * chains.length)],
        coin: coins[Math.floor(Math.random() * coins.length)],
        amount: (Math.random() * 2000000 + 100000) * (Math.random() > 0.5 ? 1 : -1),
        time: new Date(Date.now() - Math.random() * 3600000),
        txCount: Math.floor(Math.random() * 15) + 1,
      })).filter((f) => f.chain_from !== f.chain_to)
    }

    setFeeds(generateFeed())
    const interval = setInterval(() => setFeeds(generateFeed()), 5000)
    return () => clearInterval(interval)
  }, [])

  const formatAmount = (amount: number) => {
    const abs = Math.abs(amount)
    if (abs >= 1000000) return `$${(abs / 1000000).toFixed(2)}M`
    if (abs >= 1000) return `$${(abs / 1000).toFixed(1)}K`
    return `$${abs.toFixed(0)}`
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {feeds.map((feed) => (
        <div
          key={feed.id}
          className={`bg-gray-900 rounded-lg p-4 border-l-4 cursor-pointer hover:bg-gray-800 transition-colors ${
            feed.amount > 0 ? "border-green-400" : "border-red-400"
          }`}
          onClick={() =>
            onFlowSelect({ chain_from: feed.chain_from, chain_to: feed.chain_to, net_amount: feed.amount })
          }
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm text-gray-400 capitalize">
              {feed.chain_from} → {feed.chain_to}
            </span>
            <span className="text-xs text-gray-500">{Math.floor((Date.now() - feed.time.getTime()) / 60000)}m ago</span>
          </div>
          <p className="text-sm text-gray-300 mb-2">
            {formatAmount(feed.amount)} {feed.coin} {feed.amount > 0 ? "flowed into" : "flowed out of"} {feed.chain_to}
          </p>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">{feed.txCount} transactions</span>
            <span className={`font-semibold ${feed.amount > 0 ? "text-green-400" : "text-red-400"}`}>
              {feed.amount > 0 ? "+" : ""}
              {formatAmount(feed.amount)}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

// Betting Interface Component
const BettingInterface = ({ selectedFlow }: { selectedFlow: any }) => {
  const [betAmount, setBetAmount] = useState(50)
  const [betDirection, setBetDirection] = useState("inflow")

  if (!selectedFlow) {
    return (
      <div className="text-center py-8 text-gray-400">
        <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-600" />
        <p>Select a flow to place a bet</p>
      </div>
    )
  }

  const odds = betDirection === "inflow" ? 2.1 : 1.8
  const payout = betAmount * odds

  return (
    <div className="space-y-4">
      <div className="bg-gray-900 rounded-lg p-4">
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
            className={`p-3 rounded-lg border transition-colors ${
              betDirection === "inflow"
                ? "bg-green-900 border-green-400 text-green-300"
                : "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
            }`}
            onClick={() => setBetDirection("inflow")}
          >
            <div>Inflow</div>
            <div className="text-xs">2.1x</div>
          </button>
          <button
            className={`p-3 rounded-lg border transition-colors ${
              betDirection === "outflow"
                ? "bg-red-900 border-red-400 text-red-300"
                : "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
            }`}
            onClick={() => setBetDirection("outflow")}
          >
            <div>Outflow</div>
            <div className="text-xs">1.8x</div>
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Bet Amount</label>
        <div className="grid grid-cols-4 gap-2 mb-2">
          {[10, 50, 100, 500].map((amount) => (
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
          onChange={(e) => setBetAmount(Number(e.target.value) || 0)}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
        />
      </div>

      <div className="bg-gray-800 rounded-lg p-3 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Bet Amount:</span>
          <span className="text-white">${betAmount}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Odds:</span>
          <span className="text-white">{odds}x</span>
        </div>
        <div className="flex justify-between font-semibold border-t border-gray-700 pt-2">
          <span className="text-gray-300">Potential Payout:</span>
          <span className="text-green-400">${payout.toFixed(2)}</span>
        </div>
      </div>

      <button className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold py-3 rounded-lg transition-colors">
        Place {betDirection.charAt(0).toUpperCase() + betDirection.slice(1)} Bet
      </button>
    </div>
  )
}

// Main Dashboard Component
export default function FlowPulseDashboard() {
  const [selectedFlow, setSelectedFlow] = useState<any>(null)

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <StatsPanel />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-green-400 mb-4">Stablecoin Flow Heatmap</h2>
              <HeatmapGrid onFlowSelect={setSelectedFlow} />
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-green-400 mb-4">Quick Bet</h2>
            <BettingInterface selectedFlow={selectedFlow} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-green-400 mb-4">Real-time Flow Feed</h2>
            <LiveFeed onFlowSelect={setSelectedFlow} />
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-green-400 mb-4">Flow Trends</h2>
            <FlowChart selectedFlow={selectedFlow} />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="text-center py-8">
            <h3 className="text-xl font-bold text-green-400 mb-4">🚀 FlowPulse is Live!</h3>
            <p className="text-gray-300 mb-4">
              Real-time stablecoin flow monitoring with interactive heatmaps, live feeds, and betting functionality.
            </p>
            <div className="flex justify-center space-x-4 text-sm">
              <span className="bg-green-900 text-green-300 px-3 py-1 rounded">✅ Interactive Heatmap</span>
              <span className="bg-green-900 text-green-300 px-3 py-1 rounded">✅ Live Data Feed</span>
              <span className="bg-green-900 text-green-300 px-3 py-1 rounded">✅ Flow Charts</span>
              <span className="bg-green-900 text-green-300 px-3 py-1 rounded">✅ Betting Interface</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
