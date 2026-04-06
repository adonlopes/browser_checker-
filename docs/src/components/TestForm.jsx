import { useState } from 'react'
import { Check } from 'lucide-react'

const BROWSERS = [
  { id: 'chrome',  label: 'Google Chrome',    tagline: 'Best overall performance',  icon: <img src="https://raw.githubusercontent.com/alrra/browser-logos/main/src/chrome/chrome_128x128.png" style={{width: 24, height: 24}} alt="Chrome"/> },
  { id: 'firefox', label: 'Mozilla Firefox',  tagline: 'Best for privacy',          icon: <img src="https://raw.githubusercontent.com/alrra/browser-logos/main/src/firefox/firefox_128x128.png" style={{width: 24, height: 24}} alt="Firefox"/> },
  { id: 'safari',  label: 'Apple Safari',     tagline: 'Best for Apple devices',    icon: <img src="https://raw.githubusercontent.com/alrra/browser-logos/main/src/safari/safari_128x128.png" style={{width: 24, height: 24}} alt="Safari"/> },
  { id: 'edge',    label: 'Microsoft Edge',   tagline: 'Best for AI features',      icon: <img src="https://raw.githubusercontent.com/alrra/browser-logos/main/src/edge/edge_128x128.png" style={{width: 24, height: 24}} alt="Edge"/> },
  { id: 'brave',   label: 'Brave Browser',    tagline: 'Best for ad-blocking',      icon: <img src="https://raw.githubusercontent.com/alrra/browser-logos/main/src/brave/brave_128x128.png" style={{width: 24, height: 24}} alt="Brave"/> },
]

export default function TestForm({ onSubmit, loading }) {
  const [url, setUrl] = useState('')
  const [selected, setSelected] = useState([])
  const [error, setError] = useState('')

  function toggleBrowser(id) {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    )
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!url.trim()) { setError('Please enter a URL.'); return }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setError('URL must start with http:// or https://'); return
    }
    if (selected.length === 0) { setError('Select at least one browser.'); return }
    onSubmit(url.trim(), selected)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* URL input */}
      <div>
        <label className="label block mb-3 text-sm">Target URL</label>
        <input
          id="url-input"
          type="text"
          className="url-input"
          placeholder="https://example.com"
          value={url}
          onChange={e => setUrl(e.target.value)}
          disabled={loading}
          autoComplete="off"
          spellCheck="false"
        />
      </div>

      {/* Browser selection */}
      <div>
        <label className="label block mb-3 text-sm">Browsers</label>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {BROWSERS.map(b => {
            const isChecked = selected.includes(b.id)
            return (
              <label
                key={b.id}
                htmlFor={`browser-${b.id}`}
                className={`browser-checkbox ${isChecked ? 'checked' : ''}`}
                style={{ opacity: loading ? 0.5 : 1, pointerEvents: loading ? 'none' : 'auto' }}
              >
                <input
                  id={`browser-${b.id}`}
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleBrowser(b.id)}
                />
                <span className="text-base">{b.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-200 leading-tight">{b.label}</div>
                  <div className="text-xs text-gray-600 leading-tight mt-0.5">{b.tagline}</div>
                </div>
                <div className={`check-icon ${isChecked ? 'checked' : ''}`}>
                  {isChecked && <Check size={10} color="#000" strokeWidth={3} />}
                </div>
              </label>
            )
          })}
        </div>
        <p className="text-sm text-gray-500 mt-4">
          {selected.length} of {BROWSERS.length} selected
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-950/30 border border-red-900/40 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      <button
        id="run-test-btn"
        type="submit"
        className="btn-primary w-full py-4 text-base"
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="spinner" />
            Running Tests…
          </>
        ) : (
          <>
            <span>▶</span>
            Run Cross-Browser Test
          </>
        )}
      </button>
    </form>
  )
}
