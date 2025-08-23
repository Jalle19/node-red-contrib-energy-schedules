import { NodeDef, NodeInitializer } from 'node-red'
import { makeTakeAllSchedule, TakeAllScheduleOptions } from '../../schedule'
import { handleScheduleMessage } from '../helpers'
import { TakeAllScheduleNode } from '../types'
import { parseTimePeriods } from '../../parser'

interface TakeAllScheduleNodeDef extends NodeDef {
  priority: string
}

const nodeInit: NodeInitializer = (RED): void => {
  function TakeAllScheduleNodeConstructor(this: TakeAllScheduleNode, config: TakeAllScheduleNodeDef): void {
    RED.nodes.createNode(this, config)

    const scheduleOptions: TakeAllScheduleOptions = {
      name: config.name,
      priority: parseInt(config.priority),
    }

    this.context().set('scheduleOptions', scheduleOptions)

    this.on('input', (msg, send, done) => {
      const timePeriods = parseTimePeriods(msg.payload)

      const schedule = makeTakeAllSchedule(timePeriods, scheduleOptions)

      handleScheduleMessage(this, schedule, msg, send, done)
    })
  }

  RED.nodes.registerType('takeall-schedule', TakeAllScheduleNodeConstructor)
}

export = nodeInit
