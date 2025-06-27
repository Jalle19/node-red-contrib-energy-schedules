import { NodeDef, NodeInitializer } from 'node-red'
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

const TOPIC_DYNAMIC_OPTIONS = 'dynamicOptions'

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

    this.on('input', (msg, send, done) => {
      let currentScheduleOptions = this.context().get('scheduleOptions') as ScheduleOptions

      if (msg.topic === TOPIC_DYNAMIC_OPTIONS) {
        const dynamicOptions = msg.payload as Partial<ScheduleOptions>

        // Update schedule options if a configuration message is received
        currentScheduleOptions = {
          ...currentScheduleOptions,
          ...dynamicOptions,
        }

        this.context().set('scheduleOptions', currentScheduleOptions)
        done()
      } else {
        // Normal message, create schedule and send output
        const mtus = parseMtus(msg.payload)
        const schedule = makeSchedule(mtus, currentScheduleOptions)

        handleScheduleMessage(this, schedule, msg, send, done)
      }
    })
  }

  RED.nodes.registerType('create-schedule', CreateScheduleNodeConstructor)
}

export = nodeInit
