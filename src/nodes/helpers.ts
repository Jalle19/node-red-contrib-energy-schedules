import { NodeStatus } from 'node-red'
import { ScheduleItemSummary } from '../schedule'

export const createSignalerNodeStatus = (text: string): NodeStatus => {
  return { fill: 'blue', shape: 'dot', text: text }
}

export const createScheduleNodeStatus = (summary: ScheduleItemSummary): NodeStatus => {
  const fill = summary.upcoming === 0 ? 'red' : 'green'
  const text = `total: ${summary.total}, upcoming: ${summary.upcoming}`

  return { fill: fill, shape: 'dot', text: text }
}
