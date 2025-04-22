import { Node, NodeDef, NodeInitializer } from 'node-red'
import { Schedule } from '../../schedule'
import { booleanSignaler } from '../../signaler'
import { creatBooleanSignalerStatus } from '../helpers'

type BooleanSignalerNodeDef = NodeDef
type BooleanSignalerNode = Node

const nodeInit: NodeInitializer = (RED): void => {
  function BooleanSignalerNodeConstructor(this: BooleanSignalerNode, config: BooleanSignalerNodeDef): void {
    RED.nodes.createNode(this, config)

    this.on('input', (msg, send, done) => {
      const schedule = msg.payload as Schedule

      const state = booleanSignaler(new Date(), schedule)

      this.status(creatBooleanSignalerStatus(state))

      // Send the message to different outputs depending on state
      msg.payload = state
      if (state) {
        send([msg, null])
      } else {
        send([null, msg])
      }

      done()
    })
  }

  RED.nodes.registerType('boolean-signaler', BooleanSignalerNodeConstructor)
}

export = nodeInit
