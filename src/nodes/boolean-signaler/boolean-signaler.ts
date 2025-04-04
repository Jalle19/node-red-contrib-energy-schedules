import { Node, NodeDef, NodeInitializer } from 'node-red'
import { Schedule } from '../../schedule'
import { booleanSignaler } from '../../signaler'
import { creatBooleanSignalerStatus } from '../helpers'

interface BooleanSignalerNodeDef extends NodeDef {}

type BooleanSignalerNode = Node

const nodeInit: NodeInitializer = (RED): void => {
  function BooleanSignalerNodeConstructor(this: BooleanSignalerNode, config: BooleanSignalerNodeDef): void {
    RED.nodes.createNode(this, config)

    this.on('input', (msg, send, done) => {
      const schedule = msg.payload as Schedule

      const state = booleanSignaler(new Date(), schedule)
      msg.payload = state

      this.status(creatBooleanSignalerStatus(state))

      send(msg)
      done()
    })
  }

  RED.nodes.registerType('boolean-signaler', BooleanSignalerNodeConstructor)
}

export = nodeInit
