import { Prices } from './prices'

export const parsePrices = (prices: unknown): Prices => {
  // Handle both JSON and partially hydrated input (timestamps as strings)
  if (typeof prices === 'string') {
    return JSON.parse(prices, (key, value) => {
      return handleField(key, value)
    })
  } else if (Array.isArray(prices)) {
    return prices.map(price => {
      return {
        start: handleField('start', price['start']),
        end: handleField('end', price['end']),
        value: price['value'],
      }
    })
  }

  throw new TypeError("Unable to parse prices, unknown input type")
}

const handleField = (key: string, value: any): any => {
  // Convert timestamps to Date
  const dateFields = ['start', 'end']

  if (dateFields.includes(key)) {
    return new Date(value)
  }

  return value
}
