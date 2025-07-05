import { Activity, TrendingUp, AlertTriangle } from "lucide-react"

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-green-400" />
              <h1 className="text-2xl font-bold text-white">FlowPulse</h1>
            </div>
            <span className="text-gray-400 text-sm">Real-time Stablecoin Flow Dashboard</span>
          </div>

          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              <div className="text-center">
                <div className="text-sm text-gray-400">24h Volume</div>
                <div className="text-lg font-semibold text-green-400">$2.4B</div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <div className="text-center">
                <div className="text-sm text-gray-400">Active Alerts</div>
                <div className="text-lg font-semibold text-yellow-400">3</div>
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
}

export default Header
