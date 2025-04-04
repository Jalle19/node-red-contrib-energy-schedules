import { BaseScheduleOptions, Schedule, sortScheduleItems } from './schedule'

export const mergeSchedules = (schedules: Schedule[], options: BaseScheduleOptions): Schedule => {
  // Sort schedules by priority, highest first
  schedules.sort((a, b) => {
    if (a.priority === b.priority) {
      return 0
    }

    return a.priority > b.priority ? -1 : 1
  })

  // Start by copying the items from the first (highest priority) schedule
  let finalSchedule: Schedule = {
    name: options.name,
    priority: options.priority,
    items: [...schedules[0].items],
  }

  // Loop through the rest of the schedules and add their items if they don't exist already. Since
  // schedules are sorted by priority we don't need to check priorities individually.
  for (const schedule of schedules.slice(1)) {
    for (const item of schedule.items) {
      const itemExists = finalSchedule.items.find((existingItem) => {
        return (
          existingItem.start.getTime() === item.start.getTime() && existingItem.end.getTime() === item.end.getTime()
        )
      })

      if (!itemExists) {
        finalSchedule.items.push(item)
      }
    }
  }

  finalSchedule.items = sortScheduleItems(finalSchedule.items)

  return finalSchedule
}
