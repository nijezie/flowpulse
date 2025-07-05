"use client"

import { useState } from "react"
import { Plus, Trash2, ToggleLeft, ToggleRight, AlertTriangle } from "lucide-react"

const CHAINS = ["ethereum", "polygon", "arbitrum", "optimism", "solana", "bsc"]

const AlertPanel = ({ alerts, onAlertsChange }) => {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newAlert, setNewAlert] = useState({
    chain_from: "",
    chain_to: "",
    threshold_amount: "",
    alert_type: "inflow",
  })

  const formatAmount = (amount) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`
    return `$${amount.toFixed(0)}`
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Alert Management</h3>
          <p className="text-sm text-gray-400">{alerts.filter((a) => a.is_active).length} active alerts</p>
        </div>
        <button
          className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-black px-4 py-2 rounded-lg transition-colors"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          <Plus className="h-4 w-4" />
          <span>{showCreateForm ? "Cancel" : "New Alert"}</span>
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
          <h4 className="text-lg font-semibold text-green-400 mb-4">Create New Alert</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">From Chain</label>
              <select
                value={newAlert.chain_from}
                onChange={(e) => setNewAlert({ ...newAlert, chain_from: e.target.value })}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="">Select chain</option>
                {CHAINS.map((chain) => (
                  <option key={chain} value={chain}>
                    {chain.charAt(0).toUpperCase() + chain.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">To Chain</label>
              <select
                value={newAlert.chain_to}
                onChange={(e) => setNewAlert({ ...newAlert, chain_to: e.target.value })}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="">Select chain</option>
                {CHAINS.filter((chain) => chain !== newAlert.chain_from).map((chain) => (
                  <option key={chain} value={chain}>
                    {chain.charAt(0).toUpperCase() + chain.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Alert Type</label>
              <select
                value={newAlert.alert_type}
                onChange={(e) => setNewAlert({ ...newAlert, alert_type: e.target.value })}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="inflow">Inflow Alert</option>
                <option value="outflow">Outflow Alert</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Threshold Amount ($)</label>
              <input
                type="number"
                value={newAlert.threshold_amount}
                onChange={(e) => setNewAlert({ ...newAlert, threshold_amount: e.target.value })}
                placeholder="e.g. 1000000"
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>
          <div className="mt-4">
            <button className="bg-green-500 hover:bg-green-600 text-black px-6 py-2 rounded-lg transition-colors">
              Create Alert
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-600" />
            <p>No alerts configured</p>
            <p className="text-sm mt-2">Create your first alert to get notified of significant flow changes</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-gray-900 rounded-lg p-4 border-l-4 ${
                alert.is_active ? "border-green-400" : "border-gray-600"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <span className="font-semibold text-white capitalize">
                      {alert.chain_from} → {alert.chain_to}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        alert.alert_type === "inflow" ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"
                      }`}
                    >
                      {alert.alert_type.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-400">
                      Threshold: {formatAmount(Number.parseFloat(alert.threshold_amount))}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    <span>Created: {formatDate(alert.created_at)}</span>
                    {alert.triggered_at && (
                      <span className="ml-4 text-red-400">Last triggered: {formatDate(alert.triggered_at)}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    className={`p-2 rounded transition-colors ${
                      alert.is_active ? "text-green-400 hover:bg-green-900" : "text-gray-500 hover:bg-gray-800"
                    }`}
                    title={alert.is_active ? "Disable alert" : "Enable alert"}
                  >
                    {alert.is_active ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                  </button>
                  <button className="p-2 text-red-400 hover:bg-red-900 rounded transition-colors" title="Delete alert">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default AlertPanel
