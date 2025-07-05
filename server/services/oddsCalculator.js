const { pool } = require("../config/database")

class OddsCalculator {
  constructor() {
    this.baseOdds = 2.0
    this.maxOdds = 10.0
    this.minOdds = 1.1
  }

  async calculateOdds(chainFrom, chainTo) {
    try {
      // Get recent flow statistics
      const flowStats = await this.getFlowStatistics(chainFrom, chainTo)

      // Get betting statistics
      const bettingStats = await this.getBettingStatistics(chainFrom, chainTo)

      // Calculate base odds from flow patterns
      const flowOdds = this.calculateFlowBasedOdds(flowStats)

      // Adjust odds based on betting patterns
      const adjustedOdds = this.adjustOddsForBetting(flowOdds, bettingStats)

      return {
        inflow_odds: this.clampOdds(adjustedOdds.inflow),
        outflow_odds: this.clampOdds(adjustedOdds.outflow),
        confidence: this.calculateConfidence(flowStats, bettingStats),
        recent_stats: flowStats,
      }
    } catch (error) {
      console.error("Error calculating odds:", error)
      return {
        inflow_odds: this.baseOdds,
        outflow_odds: this.baseOdds,
        confidence: 0.5,
        recent_stats: null,
      }
    }
  }

  async getFlowStatistics(chainFrom, chainTo) {
    const result = await pool.query(
      `
      SELECT 
        COUNT(*) as total_flows,
        SUM(CASE WHEN amount > 0 THEN 1 ELSE 0 END) as inflow_count,
        SUM(CASE WHEN amount < 0 THEN 1 ELSE 0 END) as outflow_count,
        AVG(amount) as avg_amount,
        SUM(amount) as net_amount,
        STDDEV(amount) as amount_stddev,
        MAX(ABS(amount)) as max_amount,
        COUNT(DISTINCT DATE_TRUNC('hour', timestamp)) as active_hours
      FROM flows 
      WHERE chain_from = $1 AND chain_to = $2 
      AND timestamp > NOW() - INTERVAL '24 hours'
    `,
      [chainFrom, chainTo],
    )

    return (
      result.rows[0] || {
        total_flows: 0,
        inflow_count: 0,
        outflow_count: 0,
        avg_amount: 0,
        net_amount: 0,
        amount_stddev: 0,
        max_amount: 0,
        active_hours: 0,
      }
    )
  }

  async getBettingStatistics(chainFrom, chainTo) {
    const result = await pool.query(
      `
      SELECT 
        COUNT(*) as total_bets,
        SUM(CASE WHEN direction = 'inflow' THEN 1 ELSE 0 END) as inflow_bets,
        SUM(CASE WHEN direction = 'outflow' THEN 1 ELSE 0 END) as outflow_bets,
        AVG(CASE WHEN direction = 'inflow' THEN odds END) as avg_inflow_odds,
        AVG(CASE WHEN direction = 'outflow' THEN odds END) as avg_outflow_odds,
        SUM(amount) as total_wagered
      FROM bets 
      WHERE chain_from = $1 AND chain_to = $2 
      AND created_at > NOW() - INTERVAL '24 hours'
      AND status = 'pending'
    `,
      [chainFrom, chainTo],
    )

    return (
      result.rows[0] || {
        total_bets: 0,
        inflow_bets: 0,
        outflow_bets: 0,
        avg_inflow_odds: this.baseOdds,
        avg_outflow_odds: this.baseOdds,
        total_wagered: 0,
      }
    )
  }

  calculateFlowBasedOdds(stats) {
    const totalFlows = Number.parseInt(stats.total_flows) || 0

    if (totalFlows === 0) {
      return { inflow: this.baseOdds, outflow: this.baseOdds }
    }

    const inflowCount = Number.parseInt(stats.inflow_count) || 0
    const outflowCount = Number.parseInt(stats.outflow_count) || 0

    // Calculate probabilities based on historical patterns
    const inflowProbability = totalFlows > 0 ? inflowCount / totalFlows : 0.5
    const outflowProbability = totalFlows > 0 ? outflowCount / totalFlows : 0.5

    // Convert probabilities to odds (with house edge)
    const houseEdge = 0.05 // 5% house edge
    const inflowOdds = inflowProbability > 0 ? (1 / inflowProbability) * (1 - houseEdge) : this.baseOdds
    const outflowOdds = outflowProbability > 0 ? (1 / outflowProbability) * (1 - houseEdge) : this.baseOdds

    // Adjust for volatility
    const volatility = Number.parseFloat(stats.amount_stddev) || 0
    const volatilityFactor = Math.min(1.5, 1 + volatility / 1000000) // Cap at 1.5x

    return {
      inflow: inflowOdds * volatilityFactor,
      outflow: outflowOdds * volatilityFactor,
    }
  }

  adjustOddsForBetting(flowOdds, bettingStats) {
    const totalBets = Number.parseInt(bettingStats.total_bets) || 0

    if (totalBets === 0) {
      return flowOdds
    }

    const inflowBets = Number.parseInt(bettingStats.inflow_bets) || 0
    const outflowBets = Number.parseInt(bettingStats.outflow_bets) || 0

    // Adjust odds based on betting volume (more bets = lower odds)
    const inflowBettingRatio = totalBets > 0 ? inflowBets / totalBets : 0.5
    const outflowBettingRatio = totalBets > 0 ? outflowBets / totalBets : 0.5

    // Heavy betting on one side increases its odds (makes it less attractive)
    const maxAdjustment = 0.3 // Maximum 30% adjustment
    const inflowAdjustment = 1 + (inflowBettingRatio - 0.5) * maxAdjustment
    const outflowAdjustment = 1 + (outflowBettingRatio - 0.5) * maxAdjustment

    return {
      inflow: flowOdds.inflow * inflowAdjustment,
      outflow: flowOdds.outflow * outflowAdjustment,
    }
  }

  calculateConfidence(flowStats, bettingStats) {
    const totalFlows = Number.parseInt(flowStats.total_flows) || 0
    const activeHours = Number.parseInt(flowStats.active_hours) || 0
    const totalBets = Number.parseInt(bettingStats.total_bets) || 0

    // Confidence based on data availability
    let confidence = 0

    // Flow data confidence (0-0.6)
    if (totalFlows > 0) {
      confidence += Math.min(0.6, (totalFlows / 100) * 0.6)
    }

    // Time distribution confidence (0-0.3)
    if (activeHours > 0) {
      confidence += Math.min(0.3, (activeHours / 24) * 0.3)
    }

    // Betting data confidence (0-0.1)
    if (totalBets > 0) {
      confidence += Math.min(0.1, (totalBets / 50) * 0.1)
    }

    return Math.round(confidence * 100) / 100
  }

  clampOdds(odds) {
    return Math.max(this.minOdds, Math.min(this.maxOdds, odds))
  }
}

module.exports = new OddsCalculator()
