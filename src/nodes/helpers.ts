import { NodeStatus } from 'node-red'
import { ScheduleItemSummary } from '../schedule'

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
