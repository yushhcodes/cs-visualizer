export type VisualizationType =
  | 'sorting'
  | 'array'
  | 'tree'
  | 'graph'
  | 'stack_queue'
  | 'hashing'
  | 'general'

export interface VisualizationStep {
  id: number
  title: string
  description: string
  state: number[]
  highlight: number[]
}

export interface VisualizationData {
  concept: string
  type: VisualizationType
  summary: string
  complexity: {
    time: string
    space: string
  }
  steps: VisualizationStep[]
  initialData: number[]
  funFact: string
}