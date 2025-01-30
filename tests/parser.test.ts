import { describe, expect, test } from '@jest/globals'
import { parsePrices } from '../src/parser'
import * as fs from 'node:fs'

const PRICES_24HOURS = fs.readFileSync('tests/resources/prices.24hours.json').toString()

describe('parses price data correctly', () => {
  test('parses timestamps correctly', () => {
    const prices = parsePrices(PRICES_24HOURS)

    expect(prices.length).toEqual(24)
    const firstHour = prices[0]
    const secondHour = prices[1]

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
})
