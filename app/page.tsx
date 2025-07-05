"use client"

import { useState, useEffect } from "react"
import HeatmapGrid from "@/components/HeatmapGrid"
import NarrativeFeed from "@/components/NarrativeFeed"
import TimeSeriesChart from "@/components/TimeSeriesChart"
import AlertPanel from "@/components/AlertPanel"
import BettingInterface from "@/components/BettingInterface"
import Header from "@/components/Header"
import StatsPanel from "@/components/StatsPanel"

export default function FlowPulseDashboard() {
  const [selectedFlow, setSelectedFlow] = useState(null)
  const [flows, setFlows] = useState([])
  const [alerts, setAlerts] = useState([])

  // Mock data for preview
  useEffect(() => {
    // Generate mock flows
    const mockFlows = [
      {
        chain_from: "ethereum",
        chain_to: "polygon",
        coin: "USDC",
        net_amount: 1500000,
        transaction_count: 12,
        latest_timestamp: new Date().toISOString(),
      },
      {
        chain_from: "polygon",
        chain_to: "arbitrum",
        coin: "USDT",
        net_amount: -800000,
        transaction_count: 8,
        latest_timestamp: new Date(Date.now() - 300000).toISOString(),
      },
      {
        chain_from: "solana",
        chain_to: "ethereum",
        coin: "USDC",
        net_amount: -1200000,
        transaction_count: 15,
        latest_timestamp: new Date(Date.now() - 600000).toISOString(),
      },
      {
        chain_from: "arbitrum",
        chain_to: "optimism",
        coin: "DAI",
        net_amount: 2200000,
        transaction_count: 6,
        latest_timestamp: new Date(Date.now() - 900000).toISOString(),
      },
      {
        chain_from: "bsc",
        chain_to: "polygon",
        coin: "BUSD",
        net_amount: 950000,
        transaction_count: 9,
        latest_timestamp: new Date(Date.now() - 1200000).toISOString(),
      },
    ]

    // Generate mock alerts
    const mockAlerts = [
      {
        id: 1,
        chain_from: "ethereum",
        chain_to: "polygon",
        threshold_amount: 1000000,
        alert_type: "inflow",
        is_active: true,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        triggered_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 2,
        chain_from: "solana",
        chain_to: "ethereum",
        threshold_amount: 500000,
        alert_type: "outflow",
        is_active: true,
        created_at: new Date(Date.now() - 172800000).toISOString(),
        triggered_at: null,
      },
    ]

    setFlows(mockFlows)
    setAlerts(mockAlerts)

    // Simulate real-time updates
    const interval = setInterval(() => {
      const updatedFlows = mockFlows.map((flow) => ({
        ...flow,
        net_amount: flow.net_amount + (Math.random() - 0.5) * 100000,
        latest_timestamp: new Date().toISOString(),
      }))
      setFlows(updatedFlows)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

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
            <NarrativeFeed flows={flows} onFlowSelect={setSelectedFlow} />
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-green-400 mb-4">Flow Trends</h2>
            <TimeSeriesChart selectedFlow={selectedFlow} />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-green-400 mb-4">Alert Management</h2>
          <AlertPanel alerts={alerts} onAlertsChange={() => {}} />
        </div>
      </div>
    </div>
  )
}
