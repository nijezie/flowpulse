const validateChainPair = (chainFrom, chainTo) => {
  const validChains = ["ethereum", "polygon", "arbitrum", "optimism", "solana", "bsc"]

  if (!validChains.includes(chainFrom)) {
    throw new Error(`Invalid chain_from: ${chainFrom}`)
  }

  if (!validChains.includes(chainTo)) {
    throw new Error(`Invalid chain_to: ${chainTo}`)
  }

  if (chainFrom === chainTo) {
    throw new Error("chain_from and chain_to cannot be the same")
  }

  return true
}

const validateBetAmount = (amount) => {
  const numAmount = Number.parseFloat(amount)

  if (isNaN(numAmount)) {
    throw new Error("Bet amount must be a valid number")
  }

  if (numAmount < 1) {
    throw new Error("Minimum bet amount is $1")
  }

  if (numAmount > 10000) {
    throw new Error("Maximum bet amount is $10,000")
  }

  return numAmount
}

const validateAlertThreshold = (threshold) => {
  const numThreshold = Number.parseFloat(threshold)

  if (isNaN(numThreshold)) {
    throw new Error("Alert threshold must be a valid number")
  }

  if (numThreshold < 1000) {
    throw new Error("Minimum alert threshold is $1,000")
  }

  if (numThreshold > 100000000) {
    throw new Error("Maximum alert threshold is $100,000,000")
  }

  return numThreshold
}

const validateTimeRange = (hours) => {
  const validRanges = [1, 6, 24, 168] // 1h, 6h, 24h, 7d
  const numHours = Number.parseInt(hours)

  if (!validRanges.includes(numHours)) {
    throw new Error("Invalid time range. Valid options: 1, 6, 24, 168 hours")
  }

  return numHours
}

const sanitizeUserId = (userId) => {
  if (!userId || typeof userId !== "string") {
    throw new Error("User ID is required and must be a string")
  }

  // Remove any potentially harmful characters
  const sanitized = userId.replace(/[^a-zA-Z0-9_-]/g, "")

  if (sanitized.length < 3) {
    throw new Error("User ID must be at least 3 characters long")
  }

  if (sanitized.length > 100) {
    throw new Error("User ID must be less than 100 characters")
  }

  return sanitized
}

module.exports = {
  validateChainPair,
  validateBetAmount,
  validateAlertThreshold,
  validateTimeRange,
  sanitizeUserId,
}
