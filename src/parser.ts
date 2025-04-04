import { Prices } from './prices'

export const parsePrices = (prices: unknown): Prices => {
  // Handle both JSON and raw input
  if (typeof prices === 'string') {
    return JSON.parse(prices, (key, value) => {
      // Convert timestamps to Date
      const dateFields = ['start', 'end']

      if (dateFields.includes(key)) {
        return new Date(value)
      }

      return value
    })
  }

  // Assume the structure is correct if we're given something other than a string
  return prices as Prices
}
