import { Node, NodeDef, NodeInitializer } from 'node-red'
import { getScheduleItemSummary, makeSchedule, ScheduleMode, ScheduleOptions } from '../../schedule'
import { parsePrices } from '../../parser'
import { createScheduleNodeStatus } from '../helpers'

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

type CreateScheduleNode = Node

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
      msg.payload = schedule

      // Show schedule item summary in the node status
      const summary = getScheduleItemSummary(schedule, new Date())
      this.status(createScheduleNodeStatus(summary))

      // Store the schedule and summary in the node context too
      this.context().set('schedule', schedule)
      this.context().set('scheduleItemSummary', summary)

      send(msg)
      done()
    })
  }

  RED.nodes.registerType('create-schedule', CreateScheduleNodeConstructor)
}

export = nodeInit
