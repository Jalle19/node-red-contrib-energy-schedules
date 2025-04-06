import { NodeStatus } from 'node-red'
import { getScheduleItemSummary, Schedule, ScheduleItemSummary } from '../schedule'
import { DoneFunction, ScheduleNode, SendFunction } from './types'
import { NodeMessage } from '@node-red/registry'

export const creatBooleanSignalerStatus = (state: boolean): NodeStatus => {
  const fill = state ? 'green' : 'red'
  const text = state ? 'true' : 'false'

  return { fill: fill, shape: 'dot', text: text }
}

export const createScheduleNodeStatus = (summary: ScheduleItemSummary): NodeStatus => {
  const fill = summary.upcoming === 0 ? 'red' : 'green'
  const text = `total: ${summary.total}, upcoming: ${summary.upcoming}`

  return { fill: fill, shape: 'dot', text: text }
}

export const handleScheduleMessage = (
  node: ScheduleNode,
  schedule: Schedule,
  msg: NodeMessage,
  send: SendFunction,
  done: DoneFunction,
) => {
  // Show schedule item summary in the node status
  const summary = getScheduleItemSummary(schedule, new Date())
  node.status(createScheduleNodeStatus(summary))

  // Store the schedule and summary in the node context too
  node.context().set('schedule', schedule)
  node.context().set('scheduleItemSummary', summary)

  // Send the schedule and summary on respective outputs
  const msg1 = { ...msg }
  const msg2 = { ...msg }
  msg1.payload = schedule
  msg2.payload = summary

  send([msg1, msg2])
  done()
}
