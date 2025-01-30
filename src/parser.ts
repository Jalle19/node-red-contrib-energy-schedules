import { Prices } from './prices'

export const parsePrices = (prices: string): Prices => {
  return JSON.parse(prices, (key, value) => {
    // Convert timestamps to Date
    const dateFields = ['start', 'end']

    if (dateFields.includes(key)) {
      return new Date(value)
    }

    return value
  })
}
