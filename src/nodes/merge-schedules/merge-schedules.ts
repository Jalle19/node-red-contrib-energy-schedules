import { NodeDef, NodeInitializer } from 'node-red'
import { BaseScheduleOptions, MergeSchedulesOptions, Schedule } from '../../schedule'
import { mergeSchedules } from '../../merger'
import { handleScheduleMessage } from '../helpers'
import { MergeSchedulesNode } from '../types'

interface MergeSchedulesNodeDef extends NodeDef {
  scheduleName: string
  priority: string
  renameItems: boolean
}

const nodeInit: NodeInitializer = (RED): void => {
  function MergeSchedulesNodeConstructor(this: MergeSchedulesNode, config: MergeSchedulesNodeDef): void {
    RED.nodes.createNode(this, config)

    const scheduleOptions: MergeSchedulesOptions = {
      name: config.name,
      priority: parseInt(config.priority),
      renameItems: config.renameItems,
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
