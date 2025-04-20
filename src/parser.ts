import { MarketTimeUnits } from './mtu'

export const parseMtus = (mtus: unknown): MarketTimeUnits => {
  // Handle both JSON and partially hydrated input (timestamps as strings)
  if (typeof mtus === 'string') {
    return JSON.parse(mtus, (key, value) => {
      return handleField(key, value)
    })
  } else if (Array.isArray(mtus)) {
    return mtus.map((mtu) => {
      return {
        start: handleField('start', mtu['start']),
        end: handleField('end', mtu['end']),
        value: mtu['value'],
      }
    })
  }

  throw new TypeError('Unable to parse market time units, unknown input type')
}

const handleField = (key: string, value: any): any => {
  // Convert timestamps to Date
  const dateFields = ['start', 'end']

  if (dateFields.includes(key)) {
    return new Date(value)
  }

  return value
}
