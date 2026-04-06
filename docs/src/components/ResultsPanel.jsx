import { useState } from 'react'
import { X, ZoomIn } from 'lucide-react'

function getBrowserIcon(id) {
  const map = {
    chrome: 'chrome/chrome_128x128.png', chromium: 'chrome/chrome_128x128.png',
    firefox: 'firefox/firefox_128x128.png',
    safari: 'safari/safari_128x128.png',
    edge: 'edge/edge_128x128.png', msedge: 'edge/edge_128x128.png',
    brave: 'brave/brave_128x128.png'
  };
  const path = map[id];
  if (path) {
    return <img src={`https://raw.githubusercontent.com/alrra/browser-logos/main/src/${path}`} style={{width: 16, height: 16}} alt={id} />;
  }
  return <span>🌐</span>;
}

const BROWSER_LABELS = {
  chrome: 'Chrome', firefox: 'Firefox', safari: 'Safari', edge: 'Edge', brave: 'Brave', chromium: 'Chrome', msedge: 'Edge'
}

function StatusBadge({ status }) {
  const map = {
    success: ['badge-pass', '✓ OK'],
    pass: ['badge-pass', '✓ Pass'],
    fail: ['badge-fail', '✗ Fail'],
    warn: ['badge-warn', '⚠ Warn'],
    error: ['badge-error', '! Error'],
  }
  const [cls, label] = map[status] || ['badge-error', '?']
  return <span className={`badge ${cls}`}>{label}</span>
}

function Lightbox({ src, onClose }) {
  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <img src={src} alt="Full screenshot" className="lightbox-img" onClick={e => e.stopPropagation()} />
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="absolute top-6 left-6 text-white hover:text-gray-300 transition-colors"
        style={{ 
          zIndex: 999999999,
          background: 'rgba(0,0,0,0.8)', 
          border: '1px solid #444', 
          borderRadius: '50%', 
          width: 48, 
          height: 48, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          cursor: 'pointer' 
        }}
      >
        <X size={24} />
      </button>
    </div>
  )
}

export default function ResultsPanel({ results }) {
  const [tab, setTab] = useState('screenshots')
  const [lightbox, setLightbox] = useState(null)
  const [compTab, setCompTab] = useState(null)

  if (!results) return null

  const { screenshots = {}, comparisons = {}, summary = {}, status, url, browsers = [] } = results

  const screenshotList = Object.values(screenshots)
  const comparisonList = Object.entries(comparisons)

  return (
    <div className="card fade-up">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <div className="label mb-1">Test Results</div>
          <div className="mono text-sm text-gray-400 truncate max-w-xs">{url}</div>
        </div>
        <div className="flex items-center gap-3">
          {summary.overall_status && (
            <StatusBadge status={summary.overall_status} />
          )}
          {status === 'running' && (
            <span className="badge badge-running">
              <span className="pulse-dot">●</span> Running
            </span>
          )}
          {status === 'error' && (
            <span className="badge badge-fail">Error</span>
          )}
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Browsers', value: summary.browsers_tested ?? browsers.length },
          { label: 'Comparisons', value: summary.comparisons_made ?? comparisonList.length },
          { label: 'Status', value: status === 'completed' ? 'Done' : status === 'running' ? 'In progress' : status },
        ].map(s => (
          <div key={s.label} className="card-sm text-center">
            <div className="text-xl font-bold text-white">{s.value ?? '—'}</div>
            <div className="label mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tab-bar mb-3">
        <button className={`tab-btn ${tab === 'screenshots' ? 'active' : ''}`} onClick={() => setTab('screenshots')}>
          Screenshots ({screenshotList.length})
        </button>
        <button className={`tab-btn ${tab === 'comparisons' ? 'active' : ''}`} onClick={() => setTab('comparisons')}>
          Comparisons ({comparisonList.length})
        </button>
      </div>

      {/* Screenshots tab */}
      {tab === 'screenshots' && (
        <>
          {screenshotList.length === 0 ? (
            <div className="text-center py-12 text-gray-600 text-sm">No screenshots yet…</div>
          ) : (
            <div className="screenshot-grid">
              {screenshotList.map(item => (
                <div key={item.browser} className="screenshot-card">
                  <div className="relative">
                    {item.screenshot ? (
                      <>
                        <img
                          src={item.screenshot}
                          alt={`${item.browser} screenshot`}
                          className="screenshot-img"
                          onClick={() => setLightbox(item.screenshot)}
                        />
                        <button
                          onClick={() => setLightbox(item.screenshot)}
                          className="absolute top-2 right-2 bg-black/60 rounded p-1 text-gray-400 hover:text-white transition-colors border border-white/10"
                          title="Zoom in"
                        >
                          <ZoomIn size={14} />
                        </button>
                      </>
                    ) : (
                      <div className="screenshot-img flex items-center justify-center text-gray-700 text-xs">
                        {item.error ? 'Failed to capture' : 'Loading…'}
                      </div>
                    )}
                  </div>
                  <div className="p-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-4 h-4">{getBrowserIcon(item.browser)}</div>
                      <span className="text-sm font-medium">{BROWSER_LABELS[item.browser] ?? item.browser}</span>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                  {item.error && (
                    <div className="px-3 pb-3 text-xs text-red-400 font-mono leading-tight truncate" title={item.error}>
                      {item.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Comparisons tab */}
      {tab === 'comparisons' && (
        <>
          {comparisonList.length === 0 ? (
            <div className="text-center py-12 text-gray-600 text-sm">
              {status === 'running' ? 'Running comparison…' : 'No comparisons available.'}
            </div>
          ) : (() => {
            const groupedComparisons = {};
            const allBrowsers = new Set();
            comparisonList.forEach(([, comp]) => {
              if (comp.browsers) {
                allBrowsers.add(comp.browsers[0]);
                allBrowsers.add(comp.browsers[1]);
              }
            });
            Array.from(allBrowsers).sort().forEach(b => { groupedComparisons[b] = []; });

            comparisonList.forEach(([key, comp]) => {
              const [a, b] = comp.browsers || key.split('_vs_');
              if (groupedComparisons[a]) groupedComparisons[a].push({ ...comp, key, otherBrowser: b });
              if (groupedComparisons[b]) groupedComparisons[b].push({ ...comp, key, otherBrowser: a });
            });
            const availableBrowsers = Object.keys(groupedComparisons);
            const activeCompTab = compTab || availableBrowsers[0];
            const comps = groupedComparisons[activeCompTab] || [];

            return (
              <div className="space-y-6">
                <div className="tab-bar mb-4" style={{ gap: '8px' }}>
                  {availableBrowsers.map((b) => (
                    <button
                      key={b}
                      className={`tab-btn ${activeCompTab === b ? 'active' : ''}`}
                      onClick={() => setCompTab(b)}
                    >
                      <div className="flex items-center gap-2">
                         <div className="flex items-center justify-center w-4 h-4">{getBrowserIcon(b)}</div>
                         {BROWSER_LABELS[b] || b}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="card-sm">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-[#222] pb-3">
                    <div className="flex items-center justify-center w-5 h-5">{getBrowserIcon(activeCompTab)}</div>
                    <span style={{color: '#aaa'}}>Results for</span> {BROWSER_LABELS[activeCompTab] || activeCompTab}
                  </h3>
                  
                  <div className="space-y-6 pl-4 border-l border-[#222]">
                    {comps.map((comp) => (
                      <div key={comp.key} className="relative">
                        <div className="absolute -left-5 top-2 w-4 border-t border-[#222]" />
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <span className="text-gray-400">Compared with</span>
                            <div className="flex items-center justify-center w-4 h-4">{getBrowserIcon(comp.otherBrowser)}</div>
                            <span>{BROWSER_LABELS[comp.otherBrowser] || comp.otherBrowser}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            {comp.diff_percent != null && (
                              <span className="mono text-xs text-gray-500">{comp.diff_percent}% diff</span>
                            )}
                            <StatusBadge status={comp.status} />
                          </div>
                        </div>
                        {comp.note && (
                          <p className="text-xs text-gray-500 mb-3">{comp.note}</p>
                        )}
                        {(comp.diff_image || comp.highlight_image) && (
                          <div className="comparison-row">
                            {comp.diff_image && (
                              <div>
                                <div className="label mb-1">Diff Map</div>
                                <img
                                  src={comp.diff_image}
                                  alt="Diff"
                                  className="screenshot-img rounded-md"
                                  style={{ height: 140 }}
                                  onClick={() => setLightbox(comp.diff_image)}
                                />
                              </div>
                            )}
                            {comp.highlight_image && (
                              <div>
                                <div className="label mb-1">Highlights</div>
                                <img
                                  src={comp.highlight_image}
                                  alt="Highlight"
                                  className="screenshot-img rounded-md"
                                  style={{ height: 140 }}
                                  onClick={() => setLightbox(comp.highlight_image)}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </>
      )}

      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
    </div>
  )
}
