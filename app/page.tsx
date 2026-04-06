'use client'
import { useState, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import type { VisualizationData } from '@/lib/types'

const Visualizer = dynamic(() => import('../components/Visualizer'), { ssr: false })

const SUGGESTIONS: string[] = [
  'Binary Search', 'Bubble Sort', 'Merge Sort', 'Quick Sort',
  'Binary Search Tree', 'Stack', 'Hash Table', 'BFS', 'Dijkstra'
]

export default function Home() {
  const [concept, setConcept]       = useState<string>('')
  const [loading, setLoading]       = useState<boolean>(false)
  const [data, setData]             = useState<VisualizationData | null>(null)
  const [error, setError]           = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [isPlaying, setIsPlaying]   = useState<boolean>(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopPlayback = useCallback(() => {
    setIsPlaying(false)
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const fetchVisualization = useCallback(async (query: string): Promise<void> => {
    if (!query.trim()) return
    setLoading(true); setError(null); setData(null); setCurrentStep(0)
    stopPlayback()
    try {
      const res  = await fetch('/api/visualize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept: query.trim() }),
      })
      const json = await res.json() as VisualizationData & { error?: string }
      if (json.error) throw new Error(json.error)
      setData(json)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [stopPlayback])

  const handleSubmit = () => fetchVisualization(concept)

  const togglePlay = () => {
    if (isPlaying) { stopPlayback(); return }
    if (!data) return
    setIsPlaying(true)
    intervalRef.current = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= data.steps.length - 1) { stopPlayback(); return prev }
        return prev + 1
      })
    }, 1200)
  }

  const prevStep = () => { stopPlayback(); setCurrentStep(s => Math.max(0, s - 1)) }
  const nextStep = () => { stopPlayback(); setCurrentStep(s => Math.min((data?.steps?.length ?? 1) - 1, s + 1)) }
  const reset    = () => { stopPlayback(); setCurrentStep(0) }

  const activeStep = data?.steps?.[currentStep]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>

      {/* Subtle gradient blobs */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: `
          radial-gradient(ellipse 70% 40% at 15% 0%, rgba(22,163,74,0.05) 0%, transparent 55%),
          radial-gradient(ellipse 50% 30% at 85% 100%, rgba(22,163,74,0.04) 0%, transparent 50%)
        `
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── NAV ─────────────────────────────────────────── */}
        <nav style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 32px', height: '60px',
          borderBottom: '1px solid var(--border)',
          background: 'rgba(250,250,249,0.85)',
          backdropFilter: 'blur(12px)',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '8px',
              background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="2.5" fill="white" />
                <path d="M7 1.5V4M7 10V12.5M1.5 7H4M10 7H12.5M3.4 3.4L5.2 5.2M8.8 8.8L10.6 10.6M10.6 3.4L8.8 5.2M5.2 8.8L3.4 10.6" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </div>
            <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text)', letterSpacing: '-0.01em' }}>
              CS Visualizer
            </span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'var(--accent-green-bg)',
            border: '1px solid var(--accent-green-border)',
            borderRadius: '100px', padding: '4px 12px',
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-green)' }} />
            <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--accent-green)' }}>
              Groq · Llama 3.3
            </span>
          </div>
        </nav>

        {/* ── HERO ────────────────────────────────────────── */}
        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '72px 24px 48px' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div className="fade-up" style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '100px', padding: '5px 14px', marginBottom: '24px',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <span style={{ fontSize: '12px', color: 'var(--text-2)' }}>
                Type a concept · AI explains it · D3 animates it
              </span>
            </div>

            <h1 className="fade-up-1" style={{
              fontSize: 'clamp(36px, 6vw, 54px)',
              fontWeight: 600,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              color: 'var(--text)',
              marginBottom: '16px',
            }}>
              Visualize any<br />
              <span style={{ color: 'var(--accent-green)' }}>CS concept</span> instantly
            </h1>

            <p className="fade-up-2" style={{
              fontSize: '17px', fontWeight: 300, color: 'var(--text-2)',
              lineHeight: 1.6, maxWidth: '440px', margin: '0 auto',
            }}>
              Enter an algorithm or data structure and watch it come alive, step by step.
            </p>
          </div>

          {/* ── SEARCH ──────────────────────────────────── */}
          <div className="fade-up-3">
            <div style={{
              display: 'flex', gap: '8px', marginBottom: '16px',
              background: 'var(--surface)',
              border: '1px solid var(--border-strong)',
              borderRadius: '16px',
              padding: '6px',
              boxShadow: 'var(--shadow)',
            }}>
              <input
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  fontSize: '15px', color: 'var(--text)', padding: '10px 14px',
                  fontFamily: 'inherit',
                }}
                placeholder="e.g. Binary Search, Merge Sort, Hash Table..."
                value={concept}
                onChange={e => setConcept(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
              <button
                onClick={handleSubmit}
                disabled={loading || !concept.trim()}
                style={{
                  background: loading ? '#e5e5e3' : 'var(--accent)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontFamily: 'inherit',
                  fontSize: '14px',
                  fontWeight: 500,
                  padding: '0 22px',
                  height: '44px',
                  cursor: loading || !concept.trim() ? 'not-allowed' : 'pointer',
                  transition: 'background 0.15s',
                  whiteSpace: 'nowrap',
                }}
              >
                {loading ? 'Thinking…' : 'Visualize →'}
              </button>
            </div>

            {/* Suggestions */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => { setConcept(s); fetchVisualization(s) }}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: '100px',
                    color: 'var(--text-2)',
                    fontFamily: 'inherit',
                    fontSize: '13px',
                    padding: '6px 14px',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    const t = e.currentTarget
                    t.style.borderColor = 'var(--accent-green)'
                    t.style.color = 'var(--accent-green)'
                    t.style.background = 'var(--accent-green-bg)'
                  }}
                  onMouseLeave={e => {
                    const t = e.currentTarget
                    t.style.borderColor = 'var(--border-strong)'
                    t.style.color = 'var(--text-2)'
                    t.style.background = 'var(--surface)'
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── LOADING ─────────────────────────────────────── */}
        {loading && (
          <div className="fade-up" style={{ maxWidth: '680px', margin: '0 auto 48px', padding: '0 24px' }}>
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '16px', padding: '32px',
              display: 'flex', alignItems: 'center', gap: '16px',
              boxShadow: 'var(--shadow)',
            }}>
              <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: '7px', height: '7px', borderRadius: '50%',
                    background: 'var(--accent-green)',
                    animation: `pulseDot 1.2s ${i * 0.2}s ease-in-out infinite`,
                  }} />
                ))}
              </div>
              <span style={{ fontSize: '14px', color: 'var(--text-2)' }}>
                Generating visualization for <strong style={{ color: 'var(--text)', fontWeight: 500 }}>{concept}</strong>…
              </span>
            </div>
          </div>
        )}

        {/* ── ERROR ───────────────────────────────────────── */}
        {error && (
          <div className="fade-up" style={{ maxWidth: '680px', margin: '0 auto 48px', padding: '0 24px' }}>
            <div style={{
              background: '#fff5f5', border: '1px solid #fecaca',
              borderRadius: '12px', padding: '16px 20px',
            }}>
              <p style={{ fontSize: '14px', color: '#dc2626' }}>{error}</p>
            </div>
          </div>
        )}

        {/* ── RESULT ──────────────────────────────────────── */}
        {data && !loading && (
          <div className="fade-up" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px 80px' }}>

            {/* Header row */}
            <div style={{
              display: 'flex', alignItems: 'flex-start',
              justifyContent: 'space-between', gap: '24px',
              marginBottom: '24px',
            }}>
              <div>
                <h2 style={{
                  fontSize: '24px', fontWeight: 600, letterSpacing: '-0.02em',
                  color: 'var(--text)', marginBottom: '4px',
                }}>
                  {data.concept}
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--text-2)', lineHeight: 1.5 }}>
                  {data.summary}
                </p>
              </div>

              {data.complexity && (
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  {[
                    { label: 'Time', value: data.complexity.time },
                    { label: 'Space', value: data.complexity.space },
                  ].map(({ label, value }) => (
                    <div key={label} style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      textAlign: 'center',
                      boxShadow: 'var(--shadow-sm)',
                      minWidth: '72px',
                    }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-3)', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {label}
                      </div>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '13px', fontWeight: 500, color: 'var(--text)' }}>
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Visualization card */}
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: 'var(--shadow)',
              marginBottom: '12px',
            }}>
              {/* Step indicator bar */}
              <div style={{
                display: 'flex', height: '3px', background: 'var(--surface-2)',
              }}>
                {data.steps.map((_, i) => (
                  <div
                    key={i}
                    onClick={() => { stopPlayback(); setCurrentStep(i) }}
                    style={{
                      flex: 1,
                      background: i <= currentStep ? 'var(--accent-green)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background 0.3s',
                      borderRight: i < data.steps.length - 1 ? '1px solid var(--surface-2)' : 'none',
                    }}
                  />
                ))}
              </div>

              {/* SVG canvas */}
              <div style={{ padding: '24px 24px 16px', background: '#fafaf9' }}>
                <Visualizer data={data} currentStep={currentStep} />
              </div>

              {/* Step description */}
              <div style={{
                borderTop: '1px solid var(--border)',
                padding: '16px 24px',
                background: 'var(--surface)',
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                  <span style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '11px',
                    color: 'var(--accent-green)',
                    fontWeight: 500,
                    background: 'var(--accent-green-bg)',
                    border: '1px solid var(--accent-green-border)',
                    borderRadius: '100px',
                    padding: '2px 8px',
                    whiteSpace: 'nowrap',
                  }}>
                    {currentStep + 1} / {data.steps.length}
                  </span>
                  <span style={{ fontSize: '14px', color: 'var(--text-2)', lineHeight: 1.6 }}>
                    <strong style={{ color: 'var(--text)', fontWeight: 500 }}>
                      {activeStep?.title}
                    </strong>
                    {activeStep?.description ? ` — ${activeStep.description}` : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <ControlBtn onClick={reset} label="↺" title="Reset" />
              <ControlBtn onClick={prevStep} label="←" disabled={currentStep === 0} title="Previous" />

              <button
                onClick={togglePlay}
                style={{
                  background: isPlaying ? '#fef2f2' : 'var(--accent)',
                  border: isPlaying ? '1px solid #fca5a5' : '1px solid var(--accent)',
                  borderRadius: '8px',
                  color: isPlaying ? '#dc2626' : '#fff',
                  fontFamily: 'inherit',
                  fontSize: '13px',
                  fontWeight: 500,
                  padding: '0 18px',
                  height: '36px',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}
              >
                {isPlaying ? '⏸ Pause' : '▶ Play'}
              </button>

              <ControlBtn
                onClick={nextStep}
                label="→"
                disabled={currentStep === (data.steps?.length ?? 1) - 1}
                title="Next"
              />

              {/* Dot progress */}
              <div style={{ display: 'flex', gap: '5px', marginLeft: 'auto', alignItems: 'center' }}>
                {data.steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { stopPlayback(); setCurrentStep(i) }}
                    style={{
                      width: i === currentStep ? '20px' : '6px',
                      height: '6px',
                      borderRadius: '100px',
                      background: i === currentStep ? 'var(--accent-green)' : 'var(--border-strong)',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      transition: 'all 0.2s',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Fun fact */}
            {data.funFact && (
              <div style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '14px 18px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
              }}>
                <span style={{ fontSize: '16px', flexShrink: 0, marginTop: '1px' }}>💡</span>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '3px' }}>
                    Real world
                  </span>
                  <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.6 }}>
                    {data.funFact}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── FOOTER ──────────────────────────────────────── */}
        {!data && !loading && (
          <footer style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            borderTop: '1px solid var(--border)',
            padding: '12px 32px',
            display: 'flex', justifyContent: 'center',
            background: 'rgba(250,250,249,0.85)',
            backdropFilter: 'blur(12px)',
          }}>
            <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>
              Next.js · Groq · D3.js
            </span>
          </footer>
        )}
      </div>

      <style>{`
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(0.6); }
        }
      `}</style>
    </div>
  )
}

function ControlBtn({
  onClick, label, disabled = false, title,
}: {
  onClick: () => void
  label: string
  disabled?: boolean
  title?: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        color: disabled ? 'var(--text-3)' : 'var(--text-2)',
        fontFamily: "'DM Mono', monospace",
        fontSize: '13px',
        padding: '0 14px',
        height: '36px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s',
        opacity: disabled ? 0.45 : 1,
      }}
    >
      {label}
    </button>
  )
}