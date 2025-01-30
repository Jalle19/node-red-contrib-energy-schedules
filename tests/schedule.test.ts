import { describe, expect, it } from '@jest/globals'
import fs from 'node:fs'
import { makeSchedule, ScheduleMode } from '../src/schedule'
import { parsePrices } from '../src/parser'

const PRICES_24HOURS = fs.readFileSync('tests/resources/prices.24hours.json').toString()

describe('schedules are correctly created', () => {
  it('generates 4 lowest value items correctly', () => {
    const prices = parsePrices(PRICES_24HOURS)

    let schedule = makeSchedule(prices, {
      name: 'cheap',
      hoursFrom: 0,
      hoursTo: 24,
      numHours: 4,
      mode: ScheduleMode.LOWEST,
      priority: 0,
    })

    expect(schedule.name).toEqual('cheap')
    expect(schedule.items.length).toEqual(4)
    expect(schedule.items.map((item) => item.start.getHours())).toEqual([4, 5, 22, 23])
  })

  it('generates 4 highest value items correctly', () => {
    const prices = parsePrices(PRICES_24HOURS)

    let schedule = makeSchedule(prices, {
      name: 'expensive',
      hoursFrom: 0,
      hoursTo: 24,
      numHours: 4,
      mode: ScheduleMode.HIGHEST,
      priority: 0,
    })

    expect(schedule.name).toEqual('expensive')
    expect(schedule.items.length).toEqual(4)
    expect(schedule.items.map((item) => item.start.getHours())).toEqual([0, 7, 8, 9])
  })

  it('applies lower bound correctly', () => {
    const prices = parsePrices(PRICES_24HOURS)

    let schedule = makeSchedule(prices, {
      name: 'expensive',
      hoursFrom: 0,
      hoursTo: 24,
      numHours: 4,
      lowerBound: 10.75,
      mode: ScheduleMode.HIGHEST,
      priority: 0,
    })

    expect(schedule.name).toEqual('expensive')
    expect(schedule.items.length).toEqual(2)
    expect(schedule.items.map((item) => item.start.getHours())).toEqual([7, 8])
  })

  it('applies upper bound correctly', () => {
    const prices = parsePrices(PRICES_24HOURS)

    let schedule = makeSchedule(prices, {
      name: 'cheap',
      hoursFrom: 0,
      hoursTo: 24,
      numHours: 4,
      upperBound: 7,
      mode: ScheduleMode.LOWEST,
      priority: 0,
    })

    expect(schedule.name).toEqual('cheap')
    expect(schedule.items.length).toEqual(2)
    expect(schedule.items.map((item) => item.start.getHours())).toEqual([22, 23])
  })

  it('handles hours from and to correctly', () => {
    const prices = parsePrices(PRICES_24HOURS)

    let schedule = makeSchedule(prices, {
      name: 'cheap',
      hoursFrom: 6,
      hoursTo: 12,
      numHours: 4,
      mode: ScheduleMode.LOWEST,
      priority: 0,
    })

    expect(schedule.name).toEqual('cheap')
    expect(schedule.items.length).toEqual(4)
    expect(schedule.items.map((item) => item.start.getHours())).toEqual([6, 9, 10, 11])
  })
})
