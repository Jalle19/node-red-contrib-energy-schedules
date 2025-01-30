import { Schedule, ScheduleItem } from './schedule'

export const booleanSignaler = (timestamp: Date, schedule: Schedule): boolean => {
  return getMatchingItem(timestamp, schedule.items) !== undefined
}

export const activeScheduleSignaler = (timestamp: Date, schedule: Schedule): string | undefined => {
  const matchingItem = getMatchingItem(timestamp, schedule.items)

  return matchingItem ? matchingItem.name : undefined
}

const getMatchingItem = (timestamp: Date, items: ScheduleItem[]): ScheduleItem | undefined => {
  return items.find((item) => {
    return item.start <= timestamp && item.end > timestamp
  })
}
