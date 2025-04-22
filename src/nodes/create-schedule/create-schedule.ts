import { NodeDef, NodeInitializer, NodeMessageInFlow } from 'node-red'
import { makeSchedule, ScheduleMode, ScheduleOptions } from '../../schedule'
import { parseMtus } from '../../parser'
import { handleScheduleMessage } from '../helpers'
import { CreateScheduleNode } from '../types'

interface CreateScheduleNodeDef extends NodeDef {
  hoursFrom: string
  hoursTo: string
  numMtus: string
  mode: string
  priority: string
  lowerBound: string
  upperBound: string
}

interface CreateScheduleNodeInputMessage extends NodeMessageInFlow {
  dynamicOptions?: Partial<ScheduleOptions>
}

const nodeInit: NodeInitializer = (RED): void => {
  function CreateScheduleNodeConstructor(this: CreateScheduleNode, config: CreateScheduleNodeDef): void {
    RED.nodes.createNode(this, config)

    // Parse schedule options
    const scheduleOptions: ScheduleOptions = {
      name: config.name,
      hoursFrom: parseInt(config.hoursFrom),
      hoursTo: parseInt(config.hoursTo),
      numMtus: parseInt(config.numMtus),
      mode: config.mode as ScheduleMode,
      priority: parseInt(config.priority),
      lowerBound: config.lowerBound ? parseFloat(config.lowerBound) : undefined,
      upperBound: config.upperBound ? parseFloat(config.upperBound) : undefined,
    }

    this.context().set('scheduleOptions', scheduleOptions)

    this.on('input', (msg: CreateScheduleNodeInputMessage, send, done) => {
      const mtus = parseMtus(msg.payload)

      // Handle dynamic options
      let currentScheduleOptions = this.context().get('scheduleOptions') as ScheduleOptions

      if (msg?.dynamicOptions) {
        currentScheduleOptions = {
          ...currentScheduleOptions,
          ...msg.dynamicOptions,
        }

        this.context().set('scheduleOptions', currentScheduleOptions)
      }

      const schedule = makeSchedule(mtus, currentScheduleOptions)

      handleScheduleMessage(this, schedule, msg, send, done)
    })
  }

  RED.nodes.registerType('create-schedule', CreateScheduleNodeConstructor)
}

export = nodeInit
