import Groq from 'groq-sdk'
import { NextResponse } from 'next/server'
import type { VisualizationData } from '@/lib/types'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const SYSTEM_PROMPT = `You are a CS education expert. When given a computer science concept, return ONLY a valid JSON object (no markdown, no backticks, no explanation) with this exact structure:

{
  "concept": "Name of the concept",
  "type": "array|tree|graph|sorting|hashing|stack_queue|general",
  "summary": "One sentence explanation",
  "complexity": { "time": "O(...)", "space": "O(...)" },
  "steps": [
    {
      "id": 1,
      "title": "Step title",
      "description": "What happens in this step",
      "state": [],
      "highlight": []
    }
  ],
  "initialData": [],
  "funFact": "One interesting real-world application"
}

Rules for 'type':
- Use "sorting" for sorting algorithms (bubble, merge, quick, insertion, selection sort)
- Use "array" for array/search operations (binary search, linear search)
- Use "tree" for tree structures (BST, AVL, heap, trie)
- Use "graph" for graphs (BFS, DFS, Dijkstra)
- Use "stack_queue" for stack/queue operations
- Use "hashing" for hash tables/maps
- Use "general" for everything else (recursion, dynamic programming, etc.)

Rules for 'steps':
- 5 to 8 steps maximum
- Each step's 'state' is an array of numbers (the current data state)
- Each step's 'highlight' is an array of indices being compared/accessed
- For sorting: state = current array, highlight = indices being compared
- For trees/graphs: state = node values in order, highlight = current node indices
- For stack/queue: state = current elements, highlight = [top/front index]

Rules for 'initialData':
- Array of 6-10 numbers representing the starting data
- For sorting: random unsorted numbers like [64, 34, 25, 12, 22, 11, 90]
- For trees: node values to insert
- For graphs: adjacency as flat array

Keep descriptions concise (under 15 words each). Return ONLY the JSON.`

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json() as { concept?: string }
    const { concept } = body

    if (!concept || concept.trim().length === 0) {
      return NextResponse.json({ error: 'Concept is required' }, { status: 400 })
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Explain this CS concept with visualization steps: ${concept}` }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    })

    const raw = completion.choices[0]?.message?.content ?? ''

    // Strip any accidental markdown fences
    const cleaned = raw.replace(/```json|```/g, '').trim()

    let parsed: VisualizationData
    try {
      parsed = JSON.parse(cleaned) as VisualizationData
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse AI response', raw },
        { status: 500 }
      )
    }

    return NextResponse.json(parsed)
  } catch (err: unknown) {
    console.error('Groq API error:', err)
    // Type-safe error message extraction
    const message = err instanceof Error ? err.message : 'Something went wrong'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}