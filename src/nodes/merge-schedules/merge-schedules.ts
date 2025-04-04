import { Node, NodeDef, NodeInitializer } from 'node-red'
import { BaseScheduleOptions, getScheduleItemSummary, Schedule } from '../../schedule'
import { mergeSchedules } from '../../merger'
import { createScheduleNodeStatus } from '../helpers'

interface MergeSchedulesNodeDef extends NodeDef {
  scheduleName: string
  priority: string
}

type MergeSchedulesNode = Node

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

  RED.nodes.registerType('merge-schedules', MergeSchedulesNodeConstructor)
}

export = nodeInit
