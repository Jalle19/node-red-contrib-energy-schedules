import { describe, expect, it } from '@jest/globals'
import fs from 'node:fs'
import { getScheduleItemSummary, makeSchedule, ScheduleMode } from '../src/schedule'
import { parseTimePeriods } from '../src/parser'

const TIME_PERIODS_24HOURS = fs.readFileSync('tests/resources/timePeriods.24hours.json').toString()
const TIME_PERIODS_24HOURS_P15M = fs.readFileSync('tests/resources/timePeriods.24hours.P15M.json').toString()
const TIME_PERIODS_48HOURS = fs.readFileSync('tests/resources/timePeriods.48hours.json').toString()

describe('schedules are correctly created', () => {
  it('generates 4 lowest value items correctly', () => {
    const timePeriods = parseTimePeriods(TIME_PERIODS_24HOURS)

    const schedule = makeSchedule(timePeriods, {
      name: 'cheap',
      hoursFrom: 0,
      hoursTo: 24,
      numTimePeriods: 4,
      mode: ScheduleMode.LOWEST,
      priority: 0,
    })

    expect(schedule.name).toEqual('cheap')
    expect(schedule.items.length).toEqual(4)
    expect(schedule.items.map((item) => item.start.getHours())).toEqual([4, 5, 22, 23])
  })

  it('generates lowest P15M value items correctly', () => {
    const timePeriods = parseTimePeriods(TIME_PERIODS_24HOURS_P15M)

    const schedule = makeSchedule(timePeriods, {
      name: 'cheap',
      hoursFrom: 0,
      hoursTo: 24,
      numTimePeriods: 24,
      mode: ScheduleMode.LOWEST,
      priority: 0,
    })

    expect(schedule.name).toEqual('cheap')
    expect(schedule.items.length).toEqual(24)
    expect(
      schedule.items.map((item) => {
        return [item.start.getHours(), item.start.getMinutes()]
      }),
    ).toEqual([
      [0, 0],
      [0, 15],
      [1, 0],
      [1, 15],
      [1, 30],
      [1, 45],
      [2, 0],
      [2, 15],
      [2, 30],
      [2, 45],
      [3, 0],
      [3, 15],
      [3, 30],
      [3, 45],
      [4, 0],
      [4, 15],
      [4, 30],
      [4, 45],
      [5, 0],
      [5, 15],
      [5, 30],
      [5, 45],
      [6, 0],
      [6, 15],
    ])
  })

  it('generates 4 highest value items correctly', () => {
    const timePeriods = parseTimePeriods(TIME_PERIODS_24HOURS)

    const schedule = makeSchedule(timePeriods, {
      name: 'expensive',
      hoursFrom: 0,
      hoursTo: 24,
      numTimePeriods: 4,
      mode: ScheduleMode.HIGHEST,
      priority: 0,
    })

    expect(schedule.name).toEqual('expensive')
    expect(schedule.items.length).toEqual(4)
    expect(schedule.items.map((item) => item.start.getHours())).toEqual([0, 7, 8, 9])
  })

  it('applies lower bound correctly', () => {
    const timePeriods = parseTimePeriods(TIME_PERIODS_24HOURS)

    const schedule = makeSchedule(timePeriods, {
      name: 'expensive',
      hoursFrom: 0,
      hoursTo: 24,
      numTimePeriods: 4,
      lowerBound: 10.75,
      mode: ScheduleMode.HIGHEST,
      priority: 0,
    })

    expect(schedule.name).toEqual('expensive')
    expect(schedule.items.length).toEqual(2)
    expect(schedule.items.map((item) => item.start.getHours())).toEqual([7, 8])

    // Try with lower bound 0 too
    const schedule2 = makeSchedule(timePeriods, {
      name: 'expensive',
      hoursFrom: 0,
      hoursTo: 24,
      numTimePeriods: 4,
      lowerBound: 0,
      mode: ScheduleMode.HIGHEST,
      priority: 0,
    })

    expect(schedule2.name).toEqual('expensive')
    expect(schedule2.items.length).toEqual(4)
    expect(schedule2.items.map((item) => item.start.getHours())).toEqual([0, 7, 8, 9])
  })

  it('applies upper bound correctly', () => {
    const timePeriods = parseTimePeriods(TIME_PERIODS_24HOURS)

    const schedule = makeSchedule(timePeriods, {
      name: 'cheap',
      hoursFrom: 0,
      hoursTo: 24,
      numTimePeriods: 4,
      upperBound: 7,
      mode: ScheduleMode.LOWEST,
      priority: 0,
    })

    expect(schedule.name).toEqual('cheap')
    expect(schedule.items.length).toEqual(2)
    expect(schedule.items.map((item) => item.start.getHours())).toEqual([22, 23])

    // Try with upper bound 0 too
    const schedule2 = makeSchedule(timePeriods, {
      name: 'cheap',
      hoursFrom: 0,
      hoursTo: 24,
      numTimePeriods: 4,
      upperBound: 0,
      mode: ScheduleMode.LOWEST,
      priority: 0,
    })

    expect(schedule2.name).toEqual('cheap')
    expect(schedule2.items.length).toEqual(4)
    expect(schedule2.items.map((item) => item.start.getHours())).toEqual([4, 5, 22, 23])
  })

  it('handles hours from and to correctly', () => {
    const timePeriods = parseTimePeriods(TIME_PERIODS_24HOURS)

    const schedule = makeSchedule(timePeriods, {
      name: 'cheap',
      hoursFrom: 6,
      hoursTo: 12,
      numTimePeriods: 4,
      mode: ScheduleMode.LOWEST,
      priority: 0,
    })

    expect(schedule.name).toEqual('cheap')
    expect(schedule.items.length).toEqual(4)
    expect(schedule.items.map((item) => item.start.getHours())).toEqual([6, 9, 10, 11])
  })

  it('handles multiple days correctly', () => {
    const timePeriods = parseTimePeriods(TIME_PERIODS_48HOURS)

    const schedule = makeSchedule(timePeriods, {
      name: 'two-day-cheap',
      hoursFrom: 0,
      hoursTo: 24,
      numTimePeriods: 4,
      mode: ScheduleMode.LOWEST,
      priority: 0,
    })

    expect(schedule.items.length).toEqual(8)
    expect(schedule.items[0].start.getDate()).toEqual(13)
    expect(schedule.items[0].value).toEqual(7.45)
    expect(schedule.items[3].start.getDate()).toEqual(13)
    expect(schedule.items[3].value).toEqual(6.12)
    expect(schedule.items[4].start.getDate()).toEqual(14)
    expect(schedule.items[4].value).toEqual(5.97)
    expect(schedule.items[7].start.getDate()).toEqual(14)
    expect(schedule.items[7].value).toEqual(5.96)
  })
})

describe('schedule item summary', () => {
  it('is calculated correctly', () => {
    const timePeriods = parseTimePeriods(TIME_PERIODS_24HOURS)

    const schedule = makeSchedule(timePeriods, {
      name: 'cheap',
      hoursFrom: 0,
      hoursTo: 24,
      numTimePeriods: 6,
      mode: ScheduleMode.LOWEST,
      priority: 0,
    })

    const summary = getScheduleItemSummary(schedule, new Date('2025-01-13T10:30:00+02:00'))

    expect(summary.total).toEqual(6)
    expect(summary.upcoming).toEqual(3)
  })
})
