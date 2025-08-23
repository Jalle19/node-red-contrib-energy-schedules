import { TimePeriods } from './timePeriod'

export const parseTimePeriods = (timePeriods: unknown): TimePeriods => {
  // Handle both JSON and partially hydrated input (timestamps as strings)
  if (typeof timePeriods === 'string') {
    return JSON.parse(timePeriods, (key, value) => {
      return handleField(key, value)
    }) as TimePeriods
  } else if (Array.isArray(timePeriods)) {
    return timePeriods.map((timePeriod) => {
      return {
        // eslint-disable-next-line
        start: handleField('start', timePeriod['start']) as Date,
        // eslint-disable-next-line
        end: handleField('end', timePeriod['end']) as Date,
        // eslint-disable-next-line
        value: timePeriod['value'],
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
