import { Node, NodeDef, NodeInitializer } from 'node-red'
import { Schedule } from '../../schedule'
import { activeScheduleSignaler } from '../../signaler'

interface ActiveScheduleSignalerNodeDef extends NodeDef {}

type ActiveScheduleSignalerNode = Node

const nodeInit: NodeInitializer = (RED): void => {
  function ActiveScheduleSignalerNodeConstructor(
    this: ActiveScheduleSignalerNode,
    config: ActiveScheduleSignalerNodeDef,
  ): void {
    RED.nodes.createNode(this, config)

    this.on('input', (msg, send, done) => {
      const schedule = msg.payload as Schedule

      msg.payload = activeScheduleSignaler(new Date(), schedule)

      send(msg)
      done()
    })
  }

  RED.nodes.registerType('active-schedule-signaler', ActiveScheduleSignalerNodeConstructor)
}

export = nodeInit
