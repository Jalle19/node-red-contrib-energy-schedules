import { describe, expect, it } from '@jest/globals'
import { parsePrices } from '../src/parser'
import { makeSchedule, ScheduleMode } from '../src/schedule'
import fs from 'node:fs'
import { activeScheduleSignaler, booleanSignaler } from '../src/signaler'
import { mergeSchedules } from '../src/merger'

const PRICES_24HOURS = fs.readFileSync('tests/resources/prices.24hours.json').toString()

describe('boolean signaler works properly', () => {
  it('works properly', () => {
    const prices = parsePrices(PRICES_24HOURS)

    let schedule = makeSchedule(prices, {
      name: 'cheap',
      hoursFrom: 0,
      hoursTo: 24,
      numHours: 4,
      mode: ScheduleMode.LOWEST,
      priority: 0,
    })

    expect(booleanSignaler(new Date('2025-01-13T20:00:00.000Z'), schedule)).toEqual(true)
    expect(booleanSignaler(new Date('2025-01-13T20:59:59.000Z'), schedule)).toEqual(true)
    expect(booleanSignaler(new Date('2025-01-13T19:00:00.000Z'), schedule)).toEqual(false)
    expect(booleanSignaler(new Date('2025-01-13T19:59:59.000Z'), schedule)).toEqual(false)
  })
})

describe('active schedule signaler works properly', () => {
  it('works properly', () => {
    const prices = parsePrices(PRICES_24HOURS)

    let schedule1 = makeSchedule(prices, {
      name: 'cheap',
      hoursFrom: 0,
      hoursTo: 24,
      numHours: 4,
      mode: ScheduleMode.LOWEST,
      priority: 0,
    })

    let schedule2 = makeSchedule(prices, {
      name: 'expensive',
      hoursFrom: 0,
      hoursTo: 24,
      numHours: 4,
      mode: ScheduleMode.HIGHEST,
      priority: 0,
    })

    const mergedSchedule = mergeSchedules([schedule1, schedule2], {
      name: 'merged',
      priority: 0,
    })

    expect(activeScheduleSignaler(new Date('2025-01-13T02:00:00.000Z'), mergedSchedule)).toEqual('cheap')
    expect(activeScheduleSignaler(new Date('2025-01-13T02:59:59.000Z'), mergedSchedule)).toEqual('cheap')
    expect(activeScheduleSignaler(new Date('2025-01-13T07:00:00.000Z'), mergedSchedule)).toEqual('expensive')
    expect(activeScheduleSignaler(new Date('2025-01-13T07:59:59.000Z'), mergedSchedule)).toEqual('expensive')
    expect(activeScheduleSignaler(new Date('2023-01-13T07:00:00.000Z'), mergedSchedule)).toEqual(undefined)
    expect(activeScheduleSignaler(new Date('2023-01-13T07:59:59.000Z'), mergedSchedule)).toEqual(undefined)
  })
})
