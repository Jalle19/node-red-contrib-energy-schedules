import { NodeDef, NodeInitializer } from 'node-red'
import { BaseScheduleOptions, getScheduleItemSummary, Schedule } from '../../schedule'
import { mergeSchedules } from '../../merger'
import { createScheduleNodeStatus, handleScheduleMessage } from '../helpers'
import { MergeSchedulesNode } from '../types'

interface MergeSchedulesNodeDef extends NodeDef {
  scheduleName: string
  priority: string
}

const nodeInit: NodeInitializer = (RED): void => {
  function MergeSchedulesNodeConstructor(this: MergeSchedulesNode, config: MergeSchedulesNodeDef): void {
    RED.nodes.createNode(this, config)

    const scheduleOptions: BaseScheduleOptions = {
      name: config.name,
      priority: parseInt(config.priority),
    }

    this.context().set('scheduleOptions', scheduleOptions)

    this.on('input', (msg, send, done) => {
      const schedules = msg.payload as Schedule[]

      const schedule = mergeSchedules(schedules, scheduleOptions)

      handleScheduleMessage(this, schedule, msg, send, done)
    })
  }

  RED.nodes.registerType('merge-schedules', MergeSchedulesNodeConstructor)
}

export = nodeInit
