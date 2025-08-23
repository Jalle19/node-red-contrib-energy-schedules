import { describe, expect, test } from '@jest/globals'
import { parseTimePeriods } from '../src/parser'
import * as fs from 'node:fs'

const TIME_PERIODS_24HOURS = fs.readFileSync('tests/resources/timePeriods.24hours.json').toString()

describe('parses market time units correctly', () => {
  test('parses timestamps correctly', () => {
    const timePeriods = parseTimePeriods(TIME_PERIODS_24HOURS)

    expect(timePeriods.length).toEqual(24)
    const firstHour = timePeriods[0]
    const secondHour = timePeriods[1]

    // Check that timezone is taken into account
    expect(firstHour.start.getHours()).toEqual(0)
    expect(firstHour.start.getUTCHours()).toEqual(22)
    expect(firstHour.value).toEqual(10.22)
    expect(firstHour.end.getHours()).toEqual(1)
    expect(firstHour.end.getUTCHours()).toEqual(23)
    expect(secondHour.start.getHours()).toEqual(1)
    expect(secondHour.start.getUTCHours()).toEqual(23)
    expect(secondHour.end.getHours()).toEqual(2)
    expect(secondHour.value).toEqual(8.24)
  })

  test('parses raw data correctly', () => {
    const rawData = [
      {
        'start': '2025-04-03T09:00:00+03:00',
        'end': '2025-04-03T10:00:00+03:00',
        'value': 5.52,
      },
      {
        'start': '2025-04-03T10:00:00+03:00',
        'end': '2025-04-03T11:00:00+03:00',
        'value': 5.43,
      },
    ]

    const timePeriods = parseTimePeriods(rawData)
    const firstHour = timePeriods[0]
    const secondHour = timePeriods[1]

    expect(firstHour.start.getHours()).toEqual(9)
    expect(firstHour.value).toEqual(5.52)
    expect(secondHour.start.getHours()).toEqual(10)
    expect(secondHour.value).toEqual(5.43)
  })

  test('throws on unknown input', () => {
    expect(() => {
      parseTimePeriods(23)
    }).toThrow(TypeError)
  })
})
