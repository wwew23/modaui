export type PlanNodeState = 'pending' | 'running' | 'done' | 'failed'

export type PlanNode = {
  id: string
  actionName: string
  domain: 'theme' | 'product' | 'campaign' | 'commerce' | 'agent' | 'system'
  paramsPreview?: string
  state: PlanNodeState
}

export type PlanEdge = {
  from: string
  to: string
  type: 'dependsOn' | 'follows'
}

export type PlanGraph = {
  nodes: PlanNode[]
  edges: PlanEdge[]
}
