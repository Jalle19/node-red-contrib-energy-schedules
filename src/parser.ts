import { MarketTimeUnits } from './mtu'

export const parseMtus = (mtus: unknown): MarketTimeUnits => {
  // Handle both JSON and partially hydrated input (timestamps as strings)
  if (typeof mtus === 'string') {
    return JSON.parse(mtus, (key, value) => {
      return handleField(key, value)
    }) as MarketTimeUnits
  } else if (Array.isArray(mtus)) {
    return mtus.map((mtu) => {
      return {
        // eslint-disable-next-line
        start: handleField('start', mtu['start']) as Date,
        // eslint-disable-next-line
        end: handleField('end', mtu['end']) as Date,
        // eslint-disable-next-line
        value: mtu['value'],
      }
    })
  }

  throw new TypeError('Unable to parse market time units, unknown input type')
}

const handleField = (key: string, value: unknown): unknown => {
  // Convert timestamps to Date
  const dateFields = ['start', 'end']

  if (dateFields.includes(key)) {
    return new Date(value as string)
  }

  return value
}
