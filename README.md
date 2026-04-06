# CS Visualizer 🧠

Visualize any CS concept instantly using AI. Type a concept → Groq (Llama 3.3) breaks it into steps → D3.js animates it.

## Stack
- **Next.js 14** — frontend + API routes
- **Groq** — free, blazing-fast LLM inference (Llama 3.3 70B)
- **D3.js** — animated visualizations
- **Tailwind CSS** — styling

## Setup

### 1. Clone & Install
```bash
git clone <your-repo>
cd cs-visualizer
npm install
```

### 2. Get a FREE Groq API Key
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up (free)
3. Create an API key

### 3. Add your API key
```bash
# .env.local
GROQ_API_KEY=your_groq_api_key_here
```

### 4. Run
```bash
npm run dev
# Open http://localhost:3000
```

## What it visualizes

| Type | Examples |
|------|---------|
| Sorting | Bubble Sort, Merge Sort, Quick Sort, Insertion Sort |
| Arrays | Binary Search, Linear Search |
| Trees | BST, AVL Tree, Heap, Trie |
| Graphs | BFS, DFS, Dijkstra's |
| Stack/Queue | Stack, Queue, Deque |
| Hashing | Hash Table, Hash Map |
| General | Recursion, Dynamic Programming, etc. |

## Project Structure
```
cs-visualizer/
├── app/
│   ├── api/
│   │   └── visualize/
│   │       └── route.js       ← Groq API call
│   ├── globals.css            ← Styles + CSS variables
│   ├── layout.js              ← Root layout
│   └── page.js                ← Main UI
├── components/
│   └── Visualizer.jsx         ← D3.js animations
├── .env.local                 ← Your API key (don't commit!)
├── next.config.js
├── tailwind.config.js
└── package.json
```

## Deploy to Vercel (free)
```bash
npm install -g vercel
vercel
# Add GROQ_API_KEY in Vercel dashboard → Settings → Environment Variables
```

## How it works
1. User types a CS concept
2. Next.js API route sends it to Groq with a structured JSON prompt
3. Groq returns step-by-step breakdown with data states
4. D3.js renders the appropriate visualization (bars, nodes, cells)
5. User steps through or auto-plays the animation