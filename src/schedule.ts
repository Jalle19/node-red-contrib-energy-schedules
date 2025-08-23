import { MarketTimeUnit, TimePeriods } from './timePeriod'

export enum ScheduleMode {
  LOWEST = 'LOWEST',
  HIGHEST = 'HIGHEST',
}

export interface BaseScheduleOptions {
  name: string
  priority: number
}

export interface MergeSchedulesOptions extends BaseScheduleOptions {
  renameItems: boolean
}

export type TakeAllScheduleOptions = BaseScheduleOptions

export interface ScheduleOptions extends BaseScheduleOptions {
  hoursFrom: number
  hoursTo: number
  numTimePeriods: number
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

export const makeSchedule = (timePeriods: TimePeriods, options: ScheduleOptions): Schedule => {
  let selectedTimePeriods: TimePeriods = []

  const daySlices = getDaySlices(timePeriods)

  // Calculate slices separately for each day in the time period data
  for (const daySlice of daySlices) {
    // Narrow down the time periods to those within hoursFrom and hoursTo
    let hourSlice = getHourSlice(daySlice, options.hoursFrom, options.hoursTo)

    // Further narrow down the slice by excluding out of bounds values
    if (options.mode === ScheduleMode.LOWEST) {
      hourSlice = getLowerSlice(hourSlice, options.numTimePeriods, options.upperBound)
    } else {
      hourSlice = getUpperSlice(hourSlice, options.numTimePeriods, options.lowerBound)
    }

    selectedTimePeriods = [...selectedTimePeriods, ...hourSlice]
  }

  return {
    name: options.name,
    priority: options.priority,
    items: sortScheduleItems(timePeriodsToScheduleItems(selectedTimePeriods, options)),
  }
}

export const makeTakeAllSchedule = (timePeriods: TimePeriods, options: TakeAllScheduleOptions): Schedule => {
  return {
    name: options.name,
    priority: options.priority,
    items: sortScheduleItems(timePeriodsToScheduleItems(timePeriods, options)),
  }
}

export const getDaySlices = (timePeriods: TimePeriods): TimePeriods[] => {
  // Determine which days are available
  const days = new Set(timePeriods.map((period) => period.start.getDate()))

  // Create separate slices for each day
  const slices: TimePeriods[] = []
  for (const day of days) {
    slices.push(timePeriods.filter((period) => period.start.getDate() === day))
  }

  return slices
}

const getHourSlice = (timePeriods: TimePeriods, hoursFrom: number, hoursTo: number): TimePeriods => {
  return timePeriods.filter((period) => {
    return (
      period.start.getHours() >= hoursFrom && period.end.getHours() <= hoursTo && period.start.getHours() <= hoursTo
    )
  })
}

const getLowerSlice = (timePeriods: TimePeriods, numTimePeriods: number, upperBound?: number): TimePeriods => {
  timePeriods.sort((a: MarketTimeUnit, b: MarketTimeUnit) => {
    if (a.value === b.value) {
      return 0
    }

    return a.value < b.value ? -1 : 1
  })

  timePeriods = timePeriods.slice(0, numTimePeriods)

  if (upperBound) {
    timePeriods = timePeriods.filter((p) => p.value < upperBound)
  }

  return timePeriods
}

const getUpperSlice = (timePeriods: TimePeriods, numTimePeriods: number, lowerBound?: number): TimePeriods => {
  timePeriods.sort((a: MarketTimeUnit, b: MarketTimeUnit) => {
    if (a.value === b.value) {
      return 0
    }

    return a.value > b.value ? -1 : 1
  })

  timePeriods = timePeriods.slice(0, numTimePeriods)

  if (lowerBound) {
    timePeriods = timePeriods.filter((p) => p.value > lowerBound)
  }

  return timePeriods
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

const timePeriodsToScheduleItems = (timePeriods: TimePeriods, scheduleOptions: BaseScheduleOptions): ScheduleItem[] => {
  return timePeriods.map((period) => {
    return {
      start: period.start,
      end: period.end,
      name: scheduleOptions.name,
      value: period.value,
    }
  })
}

export const getScheduleItemSummary = (schedule: Schedule, now: Date): ScheduleItemSummary => {
  return {
    total: schedule.items.length,
    upcoming: schedule.items.filter((item) => item.end > now).length,
  }
}
