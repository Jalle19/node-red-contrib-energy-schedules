import { Node } from 'node-red'
import { NodeMessage } from '@node-red/registry'

// Base type for nodes that output a schedule
export type ScheduleNode = Node

export type CreateScheduleNode = ScheduleNode
export type MergeSchedulesNode = ScheduleNode
export type TakeAllScheduleNode = ScheduleNode

// Copied from @types/node-red__registry
export type SendFunction = (msg: NodeMessage | Array<NodeMessage | NodeMessage[] | null>) => void
export type DoneFunction = (err?: Error) => void
