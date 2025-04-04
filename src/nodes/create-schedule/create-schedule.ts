import { Node, NodeDef, NodeInitializer, NodeMessage } from 'node-red'
import { makeSchedule, ScheduleMode, ScheduleOptions } from '../../schedule'
import { parsePrices } from '../../parser'

interface CreateScheduleNodeDef extends NodeDef {
  hoursFrom: string
  hoursTo: string
  numHours: string
  mode: string
  priority: string
  lowerBound: string
  upperBound: string
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
      const prices = parsePrices(msg.payload as unknown as string)

      msg.payload = makeSchedule(prices, scheduleOptions)

      send(msg)
      done()
    })
  }

  RED.nodes.registerType('create-schedule', CreateScheduleNodeConstructor)
}

export = nodeInit
