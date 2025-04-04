import { Node, NodeDef, NodeInitializer } from 'node-red'
import { BaseScheduleOptions, Schedule } from '../../schedule'
import { mergeSchedules } from '../../merger'

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

    this.on('input', (msg, send, done) => {
      const schedules = msg.payload as Schedule[]

      msg.payload = mergeSchedules(schedules, scheduleOptions)

      send(msg)
      done()
    })
  }

  RED.nodes.registerType('merge-schedules', MergeSchedulesNodeConstructor)
}

export = nodeInit
