import "./Header.css"

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <h1>FlowPulse</h1>
          <span className="tagline">Real-time Stablecoin Flow Dashboard</span>
        </div>

        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-label">Total Volume (24h)</span>
            <span className="stat-value positive">$2.4B</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Active Chains</span>
            <span className="stat-value">6</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Live Alerts</span>
            <span className="stat-value">3</span>
          </div>
        </div>

        <div className="connection-status">
          <div className="status-indicator connected"></div>
          <span>Live</span>
        </div>
      </div>
    </header>
  )
}

export default Header
