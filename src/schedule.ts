import { MarketTimeUnit, MarketTimeUnits } from './mtu'

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

export interface ScheduleOptions extends BaseScheduleOptions {
  hoursFrom: number
  hoursTo: number
  numMtus: number
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

export const makeSchedule = (mtus: MarketTimeUnits, options: ScheduleOptions): Schedule => {
  let selectedMtus: MarketTimeUnits = []

  const daySlices = getDaySlices(mtus)

  // Calculate slices separately for each day in the MTU data
  for (const daySlice of daySlices) {
    // Narrow down the MTUs to those within hoursFrom and hoursTo
    let hourSlice = getHourSlice(daySlice, options.hoursFrom, options.hoursTo)

    // Further narrow down the slice by excluding out of bounds values
    if (options.mode === ScheduleMode.LOWEST) {
      hourSlice = getLowerSlice(hourSlice, options.numMtus, options.upperBound)
    } else {
      hourSlice = getUpperSlice(hourSlice, options.numMtus, options.lowerBound)
    }

    selectedMtus = [...selectedMtus, ...hourSlice]
  }

  return {
    name: options.name,
    priority: options.priority,
    items: sortScheduleItems(mtusToScheduleItems(selectedMtus, options)),
  }
}

export const makeTakeAllSchedule = (mtus: MarketTimeUnits, options: BaseScheduleOptions): Schedule => {
  return {
    name: options.name,
    priority: options.priority,
    items: sortScheduleItems(mtusToScheduleItems(mtus, options)),
  }
}

export const getDaySlices = (mtus: MarketTimeUnits): MarketTimeUnits[] => {
  // Determine which days are available
  const days = new Set(mtus.map((mtu) => mtu.start.getDate()))

  // Create separate slices for each day
  const slices: MarketTimeUnits[] = []
  for (const day of days) {
    slices.push(mtus.filter((mtu) => mtu.start.getDate() === day))
  }

  return slices
}

const getHourSlice = (mtus: MarketTimeUnits, hoursFrom: number, hoursTo: number): MarketTimeUnits => {
  return mtus.filter((mtu) => {
    return mtu.start.getHours() >= hoursFrom && mtu.end.getHours() <= hoursTo && mtu.start.getHours() <= hoursTo
  })
}

const getLowerSlice = (mtus: MarketTimeUnits, numMtus: number, upperBound?: number): MarketTimeUnits => {
  mtus.sort((a: MarketTimeUnit, b: MarketTimeUnit) => {
    if (a.value === b.value) {
      return 0
    }

    return a.value < b.value ? -1 : 1
  })

  mtus = mtus.slice(0, numMtus)

  if (upperBound) {
    mtus = mtus.filter((p) => p.value < upperBound)
  }

  return mtus
}

const getUpperSlice = (mtus: MarketTimeUnits, numMtus: number, lowerBound?: number): MarketTimeUnits => {
  mtus.sort((a: MarketTimeUnit, b: MarketTimeUnit) => {
    if (a.value === b.value) {
      return 0
    }

    return a.value > b.value ? -1 : 1
  })

  mtus = mtus.slice(0, numMtus)

  if (lowerBound) {
    mtus = mtus.filter((p) => p.value > lowerBound)
  }

  return mtus
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

const mtusToScheduleItems = (mtus: MarketTimeUnits, scheduleOptions: BaseScheduleOptions): ScheduleItem[] => {
  return mtus.map((mtu) => {
    return {
      start: mtu.start,
      end: mtu.end,
      name: scheduleOptions.name,
      value: mtu.value,
    }
  })
}

export const getScheduleItemSummary = (schedule: Schedule, now: Date): ScheduleItemSummary => {
  return {
    total: schedule.items.length,
    upcoming: schedule.items.filter((item) => item.end > now).length,
  }
}
