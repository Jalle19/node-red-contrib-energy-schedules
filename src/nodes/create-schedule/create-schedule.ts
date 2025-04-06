import { NodeDef, NodeInitializer } from 'node-red'
import { makeSchedule, ScheduleMode, ScheduleOptions } from '../../schedule'
import { parsePrices } from '../../parser'
import { handleScheduleMessage } from '../helpers'
import { CreateScheduleNode } from '../types'

interface CreateScheduleNodeDef extends NodeDef {
  hoursFrom: string
  hoursTo: string
  numHours: string
  mode: string
  priority: string
  lowerBound: string
  upperBound: string
}

type DynamicBounds = {
  lowerBound?: number
  upperBound?: number
}

const nodeInit: NodeInitializer = (RED): void => {
  function CreateScheduleNodeConstructor(this: CreateScheduleNode, config: CreateScheduleNodeDef): void {
    RED.nodes.createNode(this, config)

    // Parse schedule options
    const scheduleOptions: ScheduleOptions = {
      name: config.name,
      hoursFrom: parseInt(config.hoursFrom),
      hoursTo: parseInt(config.hoursTo),
      numHours: parseInt(config.numHours),
      mode: config.mode as ScheduleMode,
      priority: parseInt(config.priority),
      lowerBound: config.lowerBound ? parseFloat(config.lowerBound) : undefined,
      upperBound: config.upperBound ? parseFloat(config.upperBound) : undefined,
    }

    this.context().set('scheduleOptions', scheduleOptions)

    this.on('input', (msg, send, done) => {
      const prices = parsePrices(msg.payload)

      // Handle dynamic bounds
      let currentScheduleOptions = this.context().get('scheduleOptions') as ScheduleOptions
      const dynamicBounds: DynamicBounds | undefined = (msg as any)?.dynamicBounds

      if (dynamicBounds !== undefined) {
        if (dynamicBounds.lowerBound) {
          currentScheduleOptions.lowerBound = dynamicBounds.lowerBound
        }
        if (dynamicBounds.upperBound) {
          currentScheduleOptions.upperBound = dynamicBounds.upperBound
        }

        this.context().set('scheduleOptions', currentScheduleOptions)
      }

      const schedule = makeSchedule(prices, currentScheduleOptions)

      handleScheduleMessage(this, schedule, msg, send, done)
    })
  }

  RED.nodes.registerType('create-schedule', CreateScheduleNodeConstructor)
}

export = nodeInit
