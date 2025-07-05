"use client"

import { useState, useEffect } from "react"
import "./App.css"
import HeatmapGrid from "./components/HeatmapGrid"
import NarrativeFeed from "./components/NarrativeFeed"
import TimeSeriesChart from "./components/TimeSeriesChart"
import AlertPanel from "./components/AlertPanel"
import BettingInterface from "./components/BettingInterface"
import Header from "./components/Header"

function App() {
  const [selectedFlow, setSelectedFlow] = useState(null)
  const [flows, setFlows] = useState([])
  const [alerts, setAlerts] = useState([])
  const [ws, setWs] = useState(null)

  useEffect(() => {
    // Initialize WebSocket connection
    const websocket = new WebSocket("ws://localhost:3001")

    websocket.onopen = () => {
      console.log("Connected to WebSocket")
      setWs(websocket)
    }

    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data)

      if (message.type === "FLOW_UPDATE") {
        // Handle real-time flow updates
        fetchFlows()
      } else if (message.type === "ALERT_TRIGGERED") {
        // Handle alert notifications
        fetchAlerts()
        // You could also show a toast notification here
        console.log("Alert triggered:", message.data)
      }
    }

    websocket.onclose = () => {
      console.log("WebSocket connection closed")
      setWs(null)
    }

    // Initial data fetch
    fetchFlows()
    fetchAlerts()

    return () => {
      if (websocket) {
        websocket.close()
      }
    }
  }, [])

  const fetchFlows = async () => {
    try {
      const response = await fetch("/api/flows")
      const data = await response.json()
      if (data.success) {
        setFlows(data.data)
      }
    } catch (error) {
      console.error("Error fetching flows:", error)
    }
  }

  const fetchAlerts = async () => {
    try {
      const response = await fetch("/api/alerts")
      const data = await response.json()
      if (data.success) {
        setAlerts(data.data)
      }
    } catch (error) {
      console.error("Error fetching alerts:", error)
    }
  }

  return (
    <div className="App">
      <Header />

      <div className="main-container">
        <div className="top-section">
          <div className="heatmap-container">
            <h2>Stablecoin Flow Heatmap</h2>
            <HeatmapGrid onFlowSelect={setSelectedFlow} />
          </div>

          <div className="betting-container">
            <h2>Quick Bet</h2>
            <BettingInterface selectedFlow={selectedFlow} />
          </div>
        </div>

        <div className="middle-section">
          <div className="narrative-container">
            <h2>Real-time Flow Feed</h2>
            <NarrativeFeed flows={flows} onFlowSelect={setSelectedFlow} />
          </div>

          <div className="chart-container">
            <h2>Flow Trends</h2>
            <TimeSeriesChart selectedFlow={selectedFlow} />
          </div>
        </div>

        <div className="bottom-section">
          <div className="alerts-container">
            <h2>Alert Management</h2>
            <AlertPanel alerts={alerts} onAlertsChange={fetchAlerts} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
