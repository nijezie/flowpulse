"use client"

import { useState } from "react"
import "./AlertPanel.css"

const CHAINS = ["ethereum", "polygon", "arbitrum", "optimism", "solana", "bsc"]

const AlertPanel = ({ alerts, onAlertsChange }) => {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newAlert, setNewAlert] = useState({
    chain_from: "",
    chain_to: "",
    threshold_amount: "",
    alert_type: "inflow",
  })
  const [loading, setLoading] = useState(false)

  const handleCreateAlert = async (e) => {
    e.preventDefault()
    if (!newAlert.chain_from || !newAlert.chain_to || !newAlert.threshold_amount) {
      alert("Please fill in all fields")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/alerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newAlert,
          threshold_amount: Number.parseFloat(newAlert.threshold_amount),
        }),
      })

      const data = await response.json()
      if (data.success) {
        setNewAlert({
          chain_from: "",
          chain_to: "",
          threshold_amount: "",
          alert_type: "inflow",
        })
        setShowCreateForm(false)
        onAlertsChange()
      } else {
        alert("Failed to create alert: " + data.error)
      }
    } catch (error) {
      console.error("Error creating alert:", error)
      alert("Failed to create alert")
    }
    setLoading(false)
  }

  const handleToggleAlert = async (alertId) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}/toggle`, {
        method: "PUT",
      })

      const data = await response.json()
      if (data.success) {
        onAlertsChange()
      } else {
        alert("Failed to toggle alert: " + data.error)
      }
    } catch (error) {
      console.error("Error toggling alert:", error)
      alert("Failed to toggle alert")
    }
  }

  const handleDeleteAlert = async (alertId) => {
    if (!window.confirm("Are you sure you want to delete this alert?")) {
      return
    }

    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: "DELETE",
      })

      const data = await response.json()
      if (data.success) {
        onAlertsChange()
      } else {
        alert("Failed to delete alert: " + data.error)
      }
    } catch (error) {
      console.error("Error deleting alert:", error)
      alert("Failed to delete alert")
    }
  }

  const formatAmount = (amount) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`
    }
    return `$${amount.toFixed(0)}`
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="alert-panel">
      <div className="alert-header">
        <div className="alert-title">
          <h3>Alert Management</h3>
          <span className="alert-count">{alerts.filter((a) => a.is_active).length} active alerts</span>
        </div>
        <button className="button" onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? "Cancel" : "New Alert"}
        </button>
      </div>

      {showCreateForm && (
        <div className="create-alert-form">
          <h4>Create New Alert</h4>
          <form onSubmit={handleCreateAlert}>
            <div className="form-row">
              <div className="form-group">
                <label>From Chain</label>
                <select
                  value={newAlert.chain_from}
                  onChange={(e) => setNewAlert({ ...newAlert, chain_from: e.target.value })}
                  required
                >
                  <option value="">Select chain</option>
                  {CHAINS.map((chain) => (
                    <option key={chain} value={chain}>
                      {chain.charAt(0).toUpperCase() + chain.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>To Chain</label>
                <select
                  value={newAlert.chain_to}
                  onChange={(e) => setNewAlert({ ...newAlert, chain_to: e.target.value })}
                  required
                >
                  <option value="">Select chain</option>
                  {CHAINS.filter((chain) => chain !== newAlert.chain_from).map((chain) => (
                    <option key={chain} value={chain}>
                      {chain.charAt(0).toUpperCase() + chain.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Alert Type</label>
                <select
                  value={newAlert.alert_type}
                  onChange={(e) => setNewAlert({ ...newAlert, alert_type: e.target.value })}
                >
                  <option value="inflow">Inflow Alert</option>
                  <option value="outflow">Outflow Alert</option>
                </select>
              </div>
              <div className="form-group">
                <label>Threshold Amount ($)</label>
                <input
                  type="number"
                  value={newAlert.threshold_amount}
                  onChange={(e) => setNewAlert({ ...newAlert, threshold_amount: e.target.value })}
                  placeholder="e.g. 1000000"
                  min="0"
                  step="1000"
                  required
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="button" disabled={loading}>
                {loading ? "Creating..." : "Create Alert"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="alerts-list">
        {alerts.length === 0 ? (
          <div className="alerts-empty">
            <p>No alerts configured</p>
            <p className="alerts-empty-subtitle">Create your first alert to get notified of significant flow changes</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className={`alert-item ${alert.is_active ? "active" : "inactive"}`}>
              <div className="alert-info">
                <div className="alert-main">
                  <div className="alert-flow">
                    <span className="chain-name">
                      {alert.chain_from.charAt(0).toUpperCase() + alert.chain_from.slice(1)}
                    </span>
                    <span className="flow-arrow">→</span>
                    <span className="chain-name">
                      {alert.chain_to.charAt(0).toUpperCase() + alert.chain_to.slice(1)}
                    </span>
                  </div>
                  <div className="alert-details">
                    <span className={`alert-type ${alert.alert_type}`}>
                      {alert.alert_type.charAt(0).toUpperCase() + alert.alert_type.slice(1)}
                    </span>
                    <span className="alert-threshold">
                      Threshold: {formatAmount(Number.parseFloat(alert.threshold_amount))}
                    </span>
                  </div>
                </div>
                <div className="alert-meta">
                  <span className="alert-created">Created: {formatDate(alert.created_at)}</span>
                  {alert.triggered_at && (
                    <span className="alert-triggered">Last triggered: {formatDate(alert.triggered_at)}</span>
                  )}
                </div>
              </div>

              <div className="alert-actions">
                <button
                  className={`button secondary ${alert.is_active ? "" : "inactive"}`}
                  onClick={() => handleToggleAlert(alert.id)}
                  title={alert.is_active ? "Disable alert" : "Enable alert"}
                >
                  {alert.is_active ? "Active" : "Inactive"}
                </button>
                <button className="button danger" onClick={() => handleDeleteAlert(alert.id)} title="Delete alert">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default AlertPanel
