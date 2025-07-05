import { DollarSign, Activity, Link, AlertCircle, Dice6, TrendingUp } from "lucide-react"

const StatsPanel = () => {
  const stats = [
    {
      icon: DollarSign,
      label: "24h Volume",
      value: "$2.4B",
      change: "+12.5%",
      positive: true,
    },
    {
      icon: Activity,
      label: "Transactions",
      value: "15,847",
      change: "+8.2%",
      positive: true,
    },
    {
      icon: Link,
      label: "Active Chains",
      value: "6",
      change: "stable",
      positive: null,
    },
    {
      icon: AlertCircle,
      label: "Recent Alerts",
      value: "3",
      change: "+2",
      positive: false,
    },
    {
      icon: Dice6,
      label: "Active Bets",
      value: "127",
      change: "+15",
      positive: true,
    },
    {
      icon: TrendingUp,
      label: "Top Flow",
      value: "ETH→POLY",
      change: "$2.2M",
      positive: true,
    },
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
                    {stat.change && (
                      <div
                        className={`text-xs ${
                          stat.positive === true
                            ? "text-green-400"
                            : stat.positive === false
                              ? "text-red-400"
                              : "text-gray-400"
                        }`}
                      >
                        {stat.change}
                      </div>
                    )}
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

export default StatsPanel
