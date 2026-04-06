import { useState, useEffect, useCallback, useRef } from 'react'
import { useBackgroundEffect } from './hooks/useBackgroundEffect'
import { api } from './services/api'
import TestForm from './components/TestForm'
import ResultsPanel from './components/ResultsPanel'

const POLL_INTERVAL = 2000

// ─── Theme Toggle Switch ──────────────────────────────────
function ThemeToggle({ isLight, onToggle }) {
  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        cursor: 'pointer',
        userSelect: 'none',
        zIndex: 999999,
        position: 'relative',
        padding: '6px 10px',
        borderRadius: 999,
        background: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)',
      }}
    >
      <span style={{ fontSize: 16, lineHeight: 1 }}>☀️</span>

      {/* Hidden real checkbox — clicking the label toggles it */}
      <input
        type="checkbox"
        checked={isLight}
        onChange={onToggle}
        style={{
          position: 'absolute',
          opacity: 0,
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          margin: 0,
          cursor: 'pointer',
          zIndex: 2,
        }}
      />

      {/* Visual pill track */}
      <span style={{
        position: 'relative',
        display: 'inline-block',
        width: 40,
        height: 22,
        borderRadius: 11,
        backgroundColor: isLight ? '#222' : '#555',
        transition: 'background 0.25s',
        flexShrink: 0,
      }}>
        {/* Sliding knob */}
        <span style={{
          position: 'absolute',
          top: 3,
          left: isLight ? 21 : 3,
          width: 16,
          height: 16,
          borderRadius: '50%',
          backgroundColor: '#fff',
          transition: 'left 0.25s',
          display: 'block',
          pointerEvents: 'none',
        }} />
      </span>

      <span style={{ fontSize: 16, lineHeight: 1 }}>🌙</span>
    </label>
  )
}

// ─── Home Page ───────────────────────────────────────────
function HomePage({ onSubmit, loading, error, progress, isLight, onToggleTheme }) {
  useBackgroundEffect()

  return (
    <div className="home-page">
      <canvas id="bg-canvas" aria-hidden="true" />

      {/* Top bar with theme toggle — sits above canvas */}
      <div style={{
        position: 'absolute',
        top: 16,
        right: 20,
        zIndex: 999999,
      }}>
        <ThemeToggle isLight={isLight} onToggle={onToggleTheme} />
      </div>

      <div className="home-inner">
        {/* Header */}
        <header className="home-header fade-up">
          <div className="label mb-2">QA Automation Tool</div>
          <h1 className="home-title">
            Cross-Browser
            <span className="home-subtitle"> Compatibility Testing</span>
          </h1>
          <p className="home-desc">
            Capture screenshots across Chrome, Firefox, Safari, Edge &amp; Brave.
            Detect visual regressions automatically.
          </p>
        </header>

        {/* Form card */}
        <div className="card home-card fade-up" style={{ animationDelay: '0.06s' }}>
          <div className="label mb-4">Configure Test</div>
          <TestForm onSubmit={onSubmit} loading={loading} />
        </div>

        {/* Progress (inline, inside card area) */}
        {loading && (
          <div className="card-sm fade-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 flex items-center gap-2">
                <span className="spinner" style={{ width: 12, height: 12, borderWidth: 1.5 }} />
                Running tests across selected browsers…
              </span>
              <span className="mono text-xs text-gray-600">{progress}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${Math.max(progress, 8)}%` }} />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-950/30 border border-red-900/40 text-sm text-red-400 fade-up">
            {error}
          </div>
        )}

        <footer className="home-footer">
          Cross-Browser Compatibility Dashboard &mdash; Playwright + FastAPI
        </footer>
      </div>
    </div>
  )
}

// ─── Results Page ─────────────────────────────────────────
function ResultsPage({ results, onBack, progress, loading, isLight, onToggleTheme }) {
  return (
    <div className="results-page">
      {/* Top nav bar */}
      <nav className="results-nav">
        <button id="back-btn" className="btn-ghost" onClick={onBack}>
          ← New Test
        </button>
        <div className="results-nav-center">
          <span className="mono text-xs text-gray-400 truncate max-w-xs">
            {results?.url}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle isLight={isLight} onToggle={onToggleTheme} />
          {loading && (
            <span className="flex items-center gap-2 text-xs text-gray-500">
              <span className="spinner" style={{ width: 12, height: 12, borderWidth: 1.5 }} />
              {progress}%
            </span>
          )}
          {results?.summary?.overall_status && !loading && (
            <span className={`badge ${results.summary.overall_status === 'pass' ? 'badge-pass' : 'badge-fail'}`}>
              {results.summary.overall_status === 'pass' ? '✓ Pass' : '✗ Fail'}
            </span>
          )}
        </div>
      </nav>

      {/* Progress bar under nav */}
      {loading && (
        <div className="progress-bar" style={{ borderRadius: 0 }}>
          <div className="progress-fill" style={{ width: `${Math.max(progress, 4)}%`, transition: 'width 0.5s ease' }} />
        </div>
      )}

      {/* Scrollable results body */}
      <div className="results-body">
        <div className="results-content">
          <ResultsPanel results={results} />
        </div>
      </div>
    </div>
  )
}

// ─── Root App ─────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState('home')
  const [loading, setLoading] = useState(false)
  const [testId, setTestId] = useState(null)
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)
  const [isLight, setIsLight] = useState(false)
  const pollRef = useRef(null)

  useEffect(() => {
    if (isLight) {
      document.documentElement.classList.add('light-theme')
    } else {
      document.documentElement.classList.remove('light-theme')
    }
  }, [isLight])

  const handleToggleTheme = useCallback(() => {
    setIsLight(prev => !prev)
  }, [])

  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
  }, [])

  useEffect(() => {
    if (!testId) return
    stopPolling()
    pollRef.current = setInterval(async () => {
      try {
        const data = await api.getResults(testId)
        setResults(data)
        setProgress(data.progress ?? 0)
        if (data.status === 'completed' || data.status === 'error') {
          stopPolling()
          setLoading(false)
        }
      } catch (err) {
        console.error('Poll error:', err)
      }
    }, POLL_INTERVAL)
    return stopPolling
  }, [testId, stopPolling])

  const handleSubmit = useCallback(async (url, browsers) => {
    setError('')
    setResults(null)
    setTestId(null)
    setProgress(0)
    setLoading(true)
    setPage('results')
    try {
      const { test_id } = await api.runTest(url, browsers)
      setTestId(test_id)
    } catch (err) {
      setError(err?.response?.data?.detail ?? 'Failed to start test. Is the backend running?')
      setLoading(false)
      setPage('home')
    }
  }, [])

  const handleBack = useCallback(() => {
    stopPolling()
    setPage('home')
    setLoading(false)
    setResults(null)
    setTestId(null)
    setProgress(0)
    setError('')
  }, [stopPolling])

  if (page === 'results') {
    return (
      <ResultsPage
        results={results}
        onBack={handleBack}
        progress={progress}
        loading={loading}
        isLight={isLight}
        onToggleTheme={handleToggleTheme}
      />
    )
  }

  return (
    <HomePage
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      progress={progress}
      isLight={isLight}
      onToggleTheme={handleToggleTheme}
    />
  )
}
