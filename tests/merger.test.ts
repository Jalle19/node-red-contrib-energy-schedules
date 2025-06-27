import { describe, expect, it } from '@jest/globals'
import fs from 'node:fs'
import { parseMtus } from '../src/parser'
import { makeSchedule, makeTakeAllSchedule, ScheduleMode } from '../src/schedule'
import { mergeSchedules } from '../src/merger'

const MTUS_24HOURS = fs.readFileSync('tests/resources/mtus.24hours.json').toString()

describe('merger tests', () => {
  it('merges non-overlapping schedules correctly', () => {
    const mtus = parseMtus(MTUS_24HOURS)

    const schedule1 = makeSchedule(mtus, {
      name: 'cheap',
      hoursFrom: 0,
      hoursTo: 24,
      numMtus: 4,
      mode: ScheduleMode.LOWEST,
      priority: 0,
    })

    const schedule2 = makeSchedule(mtus, {
      name: 'expensive',
      hoursFrom: 0,
      hoursTo: 24,
      numMtus: 4,
      mode: ScheduleMode.HIGHEST,
      priority: 0,
    })

    const mergedSchedule = mergeSchedules([schedule1, schedule2], {
      name: 'merged',
      priority: 1,
      renameItems: false,
    })

    // Make sure the original schedules have not been modified
    expect(schedule1.items.length).toEqual(4)
    expect(schedule2.items.length).toEqual(4)
    expect(mergedSchedule.name).toEqual('merged')
    expect(mergedSchedule.priority).toEqual(1)
    expect(mergedSchedule.items.length).toEqual(8)

    // Check the item names to verify each item comes from the right schedule
    const itemNames = mergedSchedule.items.map((item) => item.name)
    const hours = mergedSchedule.items.map((item) => item.start.getHours())

    expect(hours).toEqual([0, 4, 5, 7, 8, 9, 22, 23])
    expect(itemNames).toEqual(['expensive', 'cheap', 'cheap', 'expensive', 'expensive', 'expensive', 'cheap', 'cheap'])
  })

  it('merges overlapping schedules according to priority', () => {
    const mtus = parseMtus(MTUS_24HOURS)

    const schedule1 = makeSchedule(mtus, {
      name: 'cheap1',
      hoursFrom: 0,
      hoursTo: 24,
      numMtus: 4,
      mode: ScheduleMode.LOWEST,
      priority: 1,
    })

    const schedule2 = makeSchedule(mtus, {
      name: 'cheap2',
      hoursFrom: 0,
      hoursTo: 24,
      numMtus: 2,
      mode: ScheduleMode.LOWEST,
      priority: 2,
    })

    const schedule3 = makeTakeAllSchedule(mtus, {
      name: 'neutral',
      priority: 0,
    })

    const mergedSchedule = mergeSchedules([schedule1, schedule2, schedule3], {
      name: 'merged',
      priority: 0,
      renameItems: false,
    })

    expect(mergedSchedule.name).toEqual('merged')
    expect(mergedSchedule.priority).toEqual(0)
    expect(mergedSchedule.items.length).toEqual(24)

    // Check the item names to verify each item comes from the right schedule
    const itemNames = mergedSchedule.items.map((item) => item.name)
    const expectedItems = ([] as string[])
      .concat(Array(4).fill('neutral'))
      .concat(Array(2).fill('cheap1'))
      .concat(Array(16).fill('neutral'))
      .concat(Array(2).fill('cheap2'))

    expect(itemNames).toEqual(expectedItems)
  })

  it('merges overlapping schedules with equal priority', () => {
    const mtus = parseMtus(MTUS_24HOURS)

    const schedule1 = makeSchedule(mtus, {
      name: 'cheap1',
      hoursFrom: 0,
      hoursTo: 24,
      numMtus: 4,
      mode: ScheduleMode.LOWEST,
      priority: 0,
    })

    const schedule2 = makeSchedule(mtus, {
      name: 'cheap2',
      hoursFrom: 0,
      hoursTo: 24,
      numMtus: 2,
      mode: ScheduleMode.LOWEST,
      priority: 0,
    })

    const mergedSchedule = mergeSchedules([schedule1, schedule2], {
      name: 'merged',
      priority: 0,
      renameItems: false,
    })

    expect(mergedSchedule.name).toEqual('merged')
    expect(mergedSchedule.priority).toEqual(0)
    expect(mergedSchedule.items.length).toEqual(4)

    // Check the item names to verify each item comes from the right schedule
    const itemNames = mergedSchedule.items.map((item) => item.name)

    expect(itemNames).toEqual(['cheap1', 'cheap1', 'cheap1', 'cheap1'])
  })

  it('renames items correctly', () => {
    const mtus = parseMtus(MTUS_24HOURS)

    const schedule1 = makeSchedule(mtus, {
      name: 'cheap1',
      hoursFrom: 0,
      hoursTo: 24,
      numMtus: 4,
      mode: ScheduleMode.LOWEST,
      priority: 0,
    })

    const schedule2 = makeSchedule(mtus, {
      name: 'cheap2',
      hoursFrom: 0,
      hoursTo: 24,
      numMtus: 2,
      mode: ScheduleMode.LOWEST,
      priority: 0,
    })

    const mergedSchedule = mergeSchedules([schedule1, schedule2], {
      name: 'new',
      priority: 0,
      renameItems: true,
    })

    expect(mergedSchedule.name).toEqual('new')
    expect(mergedSchedule.priority).toEqual(0)
    expect(mergedSchedule.items.length).toEqual(4)

    const itemNames = mergedSchedule.items.map((item) => item.name)

    expect(itemNames).toEqual(['new', 'new', 'new', 'new'])
  })
})
