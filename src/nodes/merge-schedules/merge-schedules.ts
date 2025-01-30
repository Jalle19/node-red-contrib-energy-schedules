import { Node, NodeDef, NodeInitializer } from 'node-red'
import { Schedule } from '../../schedule'
import { mergeSchedules } from '../../merger'

interface MergeSchedulesNodeDef extends NodeDef {
  scheduleName: string
}

type MergeSchedulesNode = Node

const nodeInit: NodeInitializer = (RED): void => {
  function MergeSchedulesNodeConstructor(this: MergeSchedulesNode, config: MergeSchedulesNodeDef): void {
    RED.nodes.createNode(this, config)

    this.error(config)

    this.on('input', (msg, send, done) => {
      const schedules = msg.payload as Schedule[]

      msg.payload = mergeSchedules(schedules, config.scheduleName)

      send(msg)
      done()
    })
  }

  RED.nodes.registerType('merge-schedules', MergeSchedulesNodeConstructor)
}

export = nodeInit
