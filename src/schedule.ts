import { Price, Prices } from './prices'

export enum ScheduleMode {
  LOWEST = 'LOWEST',
  HIGHEST = 'HIGHEST',
}

export interface BaseScheduleOptions {
  name: string
  priority: number
}

export interface ScheduleOptions extends BaseScheduleOptions {
  hoursFrom: number
  hoursTo: number
  numHours: number
  mode: ScheduleMode
  lowerBound?: number
  upperBound?: number
}

export type ScheduleItem = {
  start: Date
  end: Date
  name: string
  value: number
}

export type Schedule = {
  name: string
  priority: number
  items: ScheduleItem[]
}

export type ScheduleItemSummary = {
  total: number
  upcoming: number
}

export const makeSchedule = (prices: Prices, options: ScheduleOptions): Schedule => {
  let selectedPrices: Prices = []

  const daySlices = getDaySlices(prices)

  // Calculate slices separately for each day in the price data
  for (const daySlice of daySlices) {
    // Narrow down the prices to those within hoursFrom and hoursTo
    let hourSlice = getHourSlice(daySlice, options.hoursFrom, options.hoursTo)

    // Further narrow down the slice by excluding out of bounds values
    if (options.mode === ScheduleMode.LOWEST) {
      hourSlice = getLowerSlice(hourSlice, options.numHours, options.upperBound)
    } else {
      hourSlice = getUpperSlice(hourSlice, options.numHours, options.lowerBound)
    }

    selectedPrices = [...selectedPrices, ...hourSlice]
  }

  return {
    name: options.name,
    priority: options.priority,
    items: sortScheduleItems(pricesToScheduleItems(selectedPrices, options)),
  }
}

export const makeTakeAllSchedule = (prices: Prices, options: BaseScheduleOptions): Schedule => {
  return {
    name: options.name,
    priority: options.priority,
    items: sortScheduleItems(pricesToScheduleItems(prices, options)),
  }
}

export const getDaySlices = (prices: Prices): Prices[] => {
  // Determine which days are available
  const days = new Set(prices.map((price) => price.start.getDate()))

  // Create separate slices for each day
  let slices: Prices[] = []
  for (const day of days) {
    slices.push(prices.filter((price) => price.start.getDate() === day))
  }

  return slices
}

const getHourSlice = (prices: Prices, hoursFrom: number, hoursTo: number): Prices => {
  return prices.filter((price) => {
    return price.start.getHours() >= hoursFrom && price.end.getHours() <= hoursTo && price.start.getHours() <= hoursTo
  })
}

const getLowerSlice = (prices: Prices, numHours: number, upperBound?: number): Prices => {
  prices.sort((a: Price, b: Price) => {
    if (a.value === b.value) {
      return 0
    }

    return a.value < b.value ? -1 : 1
  })

  prices = prices.slice(0, numHours)

  if (upperBound) {
    prices = prices.filter((p) => p.value < upperBound)
  }

  return prices
}

const getUpperSlice = (prices: Prices, numHours: number, lowerBound?: number): Prices => {
  prices.sort((a: Price, b: Price) => {
    if (a.value === b.value) {
      return 0
    }

    return a.value > b.value ? -1 : 1
  })

  prices = prices.slice(0, numHours)

  if (lowerBound) {
    prices = prices.filter((p) => p.value > lowerBound)
  }

  return prices
}

export const sortScheduleItems = (items: ScheduleItem[]): ScheduleItem[] => {
  items.sort((a, b) => {
    if (a.start.getTime() === b.start.getTime()) {
      return 0
    }

    return a.start.getTime() > b.start.getTime() ? 1 : -1
  })

  return items
}

const pricesToScheduleItems = (prices: Prices, scheduleOptions: BaseScheduleOptions): ScheduleItem[] => {
  return prices.map((price) => {
    return {
      start: price.start,
      end: price.end,
      name: scheduleOptions.name,
      value: price.value,
    }
  })
}

export const getScheduleItemSummary = (schedule: Schedule, now: Date): ScheduleItemSummary => {
  return {
    total: schedule.items.length,
    upcoming: schedule.items.filter((item) => item.end > now).length,
  }
}
