'use client'
import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import type { VisualizationData, VisualizationStep } from '@/lib/types'

interface VisualizerProps {
  data: VisualizationData
  currentStep: number
}

export default function Visualizer({ data, currentStep }: VisualizerProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!data || !svgRef.current) return

    const step = data.steps[currentStep]
    if (!step) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const W = svgRef.current.clientWidth || 600
    const H = 260

    svg.attr('width', W).attr('height', H)

    switch (data.type) {
      case 'sorting':
        renderBars(svg, step, W, H)
        break
      case 'array':
        renderArray(svg, step, W, H)
        break
      case 'tree':
        renderTree(svg, step, data, W, H)
        break
      case 'stack_queue':
        renderStackQueue(svg, step, W, H)
        break
      case 'hashing':
        renderHashing(svg, step, W, H)
        break
      case 'graph':
        renderGraph(svg, step, data, W, H)
        break
      default:
        renderGeneral(svg, step, W, H)
    }
  }, [data, currentStep])

  return (
    <svg
      ref={svgRef}
      className="w-full"
      style={{ minHeight: '260px' }}
    />
  )
}

// ─── Types ────────────────────────────────────────────────────────
type SVGSelection = d3.Selection<SVGSVGElement, unknown, null, undefined>
type GSelection = d3.Selection<SVGGElement, unknown, null, undefined>

// ─── BAR CHART for sorting ────────────────────────────────────────
function renderBars(svg: SVGSelection, step: VisualizationStep, W: number, H: number): void {
  const arr = step.state ?? []
  if (arr.length === 0) return

  const margin = { top: 20, right: 20, bottom: 30, left: 20 }
  const w = W - margin.left - margin.right
  const h = H - margin.top - margin.bottom

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  const maxVal = d3.max(arr) ?? 1
  const x = d3.scaleBand()
    .domain(arr.map((_, i) => String(i)))
    .range([0, w])
    .padding(0.15)
  const y = d3.scaleLinear().domain([0, maxVal]).range([h, 0])

  g.selectAll<SVGRectElement, number>('.bar')
    .data(arr)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', (_, i) => x(String(i)) ?? 0)
    .attr('y', h)
    .attr('width', x.bandwidth())
    .attr('height', 0)
    .attr('rx', 3)
    .attr('fill', (_, i) => step.highlight?.includes(i) ? 'var(--node-active)' : '#1e3a2e')
    .attr('stroke', (_, i) => step.highlight?.includes(i) ? 'var(--node-active)' : 'transparent')
    .attr('stroke-width', 1.5)
    .transition()
    .duration(400)
    .delay((_, i) => i * 30)
    .attr('y', d => y(d))
    .attr('height', d => h - y(d))

  g.selectAll<SVGTextElement, number>('.bar-label')
    .data(arr)
    .enter()
    .append('text')
    .attr('x', (_, i) => (x(String(i)) ?? 0) + x.bandwidth() / 2)
    .attr('y', h + 18)
    .attr('text-anchor', 'middle')
    .attr('font-family', 'JetBrains Mono')
    .attr('font-size', '10px')
    .attr('fill', (_, i) => step.highlight?.includes(i) ? 'var(--node-active)' : '#555')
    .text(d => d)
}

// ─── ARRAY CELLS for search/array ops ────────────────────────────
function renderArray(svg: SVGSelection, step: VisualizationStep, W: number, H: number): void {
  const arr = step.state ?? []
  if (arr.length === 0) return

  const cellSize = Math.min(60, (W - 80) / arr.length)
  const startX = (W - arr.length * cellSize) / 2
  const y = H / 2 - cellSize / 2

  const g = svg.append('g')

  arr.forEach((val, i) => {
    const x = startX + i * cellSize
    const isHighlight = step.highlight?.includes(i) ?? false

    g.append('rect')
      .attr('x', x)
      .attr('y', y)
      .attr('width', cellSize - 4)
      .attr('height', cellSize)
      .attr('rx', 4)
      .attr('fill', isHighlight ? 'var(--accent-dim)' : 'var(--node-default)')
      .attr('stroke', isHighlight ? 'var(--node-active)' : 'var(--border)')
      .attr('stroke-width', isHighlight ? 2 : 1)
      .style('opacity', 0)
      .transition()
      .duration(300)
      .delay(i * 40)
      .style('opacity', 1)

    g.append('text')
      .attr('x', x + (cellSize - 4) / 2)
      .attr('y', y + cellSize / 2 + 5)
      .attr('text-anchor', 'middle')
      .attr('font-family', 'JetBrains Mono')
      .attr('font-size', '13px')
      .attr('font-weight', isHighlight ? '700' : '400')
      .attr('fill', isHighlight ? 'var(--node-active)' : 'var(--text)')
      .text(val)

    g.append('text')
      .attr('x', x + (cellSize - 4) / 2)
      .attr('y', y + cellSize + 18)
      .attr('text-anchor', 'middle')
      .attr('font-family', 'JetBrains Mono')
      .attr('font-size', '9px')
      .attr('fill', '#444')
      .text(i)
  })

  if ((step.highlight?.length ?? 0) > 0) {
    const hi = step.highlight[0]
    const px = startX + hi * cellSize + (cellSize - 4) / 2
    g.append('text')
      .attr('x', px)
      .attr('y', y - 10)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('fill', 'var(--node-active)')
      .text('▼')
  }
}

// ─── TREE ─────────────────────────────────────────────────────────
interface TreeNode {
  val: number
  left: TreeNode | null
  right: TreeNode | null
}

interface HierarchyDatum {
  name: string
  children?: HierarchyDatum[]
}

function renderTree(
  svg: SVGSelection,
  step: VisualizationStep,
  data: VisualizationData,
  W: number,
  H: number
): void {
  const values = step.state.length > 0 ? step.state : (data.initialData ?? [])
  if (values.length === 0) return

  function createNode(v: number): TreeNode {
    return { val: v, left: null, right: null }
  }

  function insert(root: TreeNode | null, val: number): TreeNode {
    if (!root) return createNode(val)
    if (val < root.val) root.left = insert(root.left, val)
    else root.right = insert(root.right, val)
    return root
  }

  let root: TreeNode | null = null
  for (const v of values) root = insert(root, v)

  function toHierarchy(node: TreeNode | null): HierarchyDatum | null {
    if (!node) return null
    const obj: HierarchyDatum = { name: String(node.val), children: [] }
    if (node.left) obj.children!.push(toHierarchy(node.left)!)
    if (node.right) obj.children!.push(toHierarchy(node.right)!)
    if (obj.children!.length === 0) delete obj.children
    return obj
  }

  const hierarchyData = toHierarchy(root)
  if (!hierarchyData) return

  const treeLayout = d3.tree<HierarchyDatum>().size([W - 60, H - 80])
  const rootNode = d3.hierarchy(hierarchyData)
  treeLayout(rootNode)

  const g = svg.append('g').attr('transform', 'translate(30, 30)')

  g.selectAll<SVGPathElement, d3.HierarchyLink<HierarchyDatum>>('.link')
    .data(rootNode.links())
    .enter()
    .append('path')
    .attr('class', 'link')
    .attr('d', d3.linkVertical<d3.HierarchyLink<HierarchyDatum>, d3.HierarchyPointNode<HierarchyDatum>>()
      .x(d => d.x)
      .y(d => d.y)
    )
    .attr('stroke', 'var(--border)')
    .attr('stroke-width', 1.5)
    .attr('fill', 'none')

  const node = g.selectAll<SVGGElement, d3.HierarchyPointNode<HierarchyDatum>>('.node')
    .data(rootNode.descendants())
    .enter()
    .append('g')
    .attr('transform', d => `translate(${d.x},${d.y})`)

  node.append('circle')
    .attr('r', 18)
    .attr('fill', d =>
      step.highlight?.includes(parseInt(d.data.name)) ? 'var(--accent-dim)' : 'var(--node-default)'
    )
    .attr('stroke', d =>
      step.highlight?.includes(parseInt(d.data.name)) ? 'var(--node-active)' : 'var(--border)'
    )
    .attr('stroke-width', 2)

  node.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '0.35em')
    .attr('font-family', 'JetBrains Mono')
    .attr('font-size', '11px')
    .attr('font-weight', '500')
    .attr('fill', d =>
      step.highlight?.includes(parseInt(d.data.name)) ? 'var(--node-active)' : 'var(--text)'
    )
    .text(d => d.data.name)
}

// ─── STACK / QUEUE ────────────────────────────────────────────────
function renderStackQueue(svg: SVGSelection, step: VisualizationStep, W: number, H: number): void {
  const arr = step.state ?? []
  const cellH = 44
  const cellW = 120
  const startX = W / 2 - cellW / 2

  const g = svg.append('g')

  g.append('text')
    .attr('x', W / 2)
    .attr('y', 22)
    .attr('text-anchor', 'middle')
    .attr('font-family', 'JetBrains Mono')
    .attr('font-size', '10px')
    .attr('fill', '#555')
    .text('← TOP')

  arr.slice().reverse().forEach((val, i) => {
    const origIdx = arr.length - 1 - i
    const y = 35 + i * (cellH + 4)
    const isHighlight = step.highlight?.includes(origIdx) ?? false

    if (y + cellH > H - 10) return

    g.append('rect')
      .attr('x', startX)
      .attr('y', y)
      .attr('width', cellW)
      .attr('height', cellH)
      .attr('rx', 4)
      .attr('fill', isHighlight ? 'var(--accent-dim)' : 'var(--node-default)')
      .attr('stroke', isHighlight ? 'var(--node-active)' : 'var(--border)')
      .attr('stroke-width', isHighlight ? 2 : 1)
      .style('opacity', 0)
      .transition().duration(300).delay(i * 50)
      .style('opacity', 1)

    g.append('text')
      .attr('x', W / 2)
      .attr('y', y + cellH / 2 + 5)
      .attr('text-anchor', 'middle')
      .attr('font-family', 'JetBrains Mono')
      .attr('font-size', '14px')
      .attr('fill', isHighlight ? 'var(--node-active)' : 'var(--text)')
      .text(val)
  })
}

// ─── HASH TABLE ───────────────────────────────────────────────────
function renderHashing(svg: SVGSelection, step: VisualizationStep, W: number, H: number): void {
  const arr = step.state ?? []
  const buckets = 8
  const bucketW = (W - 60) / buckets
  const bucketH = 50
  const startX = 30
  const startY = H / 2 - bucketH / 2

  const g = svg.append('g')

  for (let i = 0; i < buckets; i++) {
    const x = startX + i * bucketW
    const isActive = step.highlight?.includes(i) ?? false
    const val = arr[i] !== undefined ? arr[i] : null

    g.append('rect')
      .attr('x', x + 2)
      .attr('y', startY)
      .attr('width', bucketW - 4)
      .attr('height', bucketH)
      .attr('rx', 4)
      .attr('fill', isActive ? 'var(--accent-dim)' : val !== null ? '#1a2e22' : 'var(--node-default)')
      .attr('stroke', isActive ? 'var(--node-active)' : 'var(--border)')
      .attr('stroke-width', isActive ? 2 : 1)

    g.append('text')
      .attr('x', x + bucketW / 2)
      .attr('y', startY + bucketH / 2 + 5)
      .attr('text-anchor', 'middle')
      .attr('font-family', 'JetBrains Mono')
      .attr('font-size', '12px')
      .attr('fill', val !== null ? (isActive ? 'var(--node-active)' : 'var(--text)') : '#333')
      .text(val !== null ? String(val) : '—')

    g.append('text')
      .attr('x', x + bucketW / 2)
      .attr('y', startY + bucketH + 16)
      .attr('text-anchor', 'middle')
      .attr('font-family', 'JetBrains Mono')
      .attr('font-size', '9px')
      .attr('fill', '#444')
      .text(`[${i}]`)
  }
}

// ─── GRAPH ────────────────────────────────────────────────────────
interface GraphNode {
  id: number
  val: number
  x: number
  y: number
}

function renderGraph(
  svg: SVGSelection,
  step: VisualizationStep,
  data: VisualizationData,
  W: number,
  H: number
): void {
  const nodeCount = Math.min(step.state?.length ?? 6, 8)
  const nodes: GraphNode[] = Array.from({ length: nodeCount }, (_, i) => ({
    id: i,
    val: step.state?.[i] ?? i,
    x: 0,
    y: 0,
  }))

  const cx = W / 2
  const cy = H / 2
  const r = Math.min(W, H) * 0.35

  nodes.forEach((n, i) => {
    const angle = (2 * Math.PI * i) / nodeCount - Math.PI / 2
    n.x = cx + r * Math.cos(angle)
    n.y = cy + r * Math.sin(angle)
  })

  const edges: [number, number][] = []
  for (let i = 0; i < nodeCount; i++) {
    edges.push([i, (i + 1) % nodeCount])
    if (i % 2 === 0 && i + 2 < nodeCount) edges.push([i, i + 2])
  }

  const g = svg.append('g')

  edges.forEach(([a, b]) => {
    g.append('line')
      .attr('x1', nodes[a].x).attr('y1', nodes[a].y)
      .attr('x2', nodes[b].x).attr('y2', nodes[b].y)
      .attr('stroke', 'var(--border)')
      .attr('stroke-width', 1.5)
  })

  nodes.forEach(n => {
    const isActive = step.highlight?.includes(n.id) ?? false
    g.append('circle')
      .attr('cx', n.x).attr('cy', n.y).attr('r', 22)
      .attr('fill', isActive ? 'var(--accent-dim)' : 'var(--node-default)')
      .attr('stroke', isActive ? 'var(--node-active)' : 'var(--border)')
      .attr('stroke-width', isActive ? 2.5 : 1.5)

    g.append('text')
      .attr('x', n.x).attr('y', n.y + 5)
      .attr('text-anchor', 'middle')
      .attr('font-family', 'JetBrains Mono')
      .attr('font-size', '12px')
      .attr('fill', isActive ? 'var(--node-active)' : 'var(--text)')
      .text(n.val)
  })
}

// ─── GENERAL (fallback) ───────────────────────────────────────────
function renderGeneral(svg: SVGSelection, step: VisualizationStep, W: number, H: number): void {
  if ((step.state?.length ?? 0) > 0) {
    renderArray(svg, step, W, H)
    return
  }

  svg.append('text')
    .attr('x', W / 2).attr('y', H / 2)
    .attr('text-anchor', 'middle')
    .attr('font-family', 'JetBrains Mono')
    .attr('font-size', '13px')
    .attr('fill', '#444')
    .text(step.title ?? 'Visualization')
}