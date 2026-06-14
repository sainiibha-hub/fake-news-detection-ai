import { useState, useRef } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { AlertTriangle, CheckCircle, HelpCircle, Search, Trash2, ChevronDown, ChevronUp, Newspaper } from 'lucide-react'

interface AnalysisResult {
  verdict: 'FAKE' | 'REAL' | 'UNCERTAIN'
  confidence: number
  summary: string
  reasoning: string
  redFlags: string[]
  positiveIndicators: string[]
  credibilityScore: number
  category: string
}

interface HistoryItem {
  id: string
  text: string
  result: AnalysisResult
  timestamp: Date
}

const EXAMPLE_ARTICLES = [
  {
    label: 'Suspicious article',
    text: `BREAKING: Scientists SHOCKED as new miracle cure eliminates ALL diseases overnight!! Doctors HATE this one weird trick that Big Pharma doesn't want you to know about. A man from Ohio claims he cured his cancer, diabetes, AND arthritis in just 3 days using this ancient SECRET remedy that the government is trying to SUPPRESS. Share this before they DELETE it!! Sources: "Trust me bro" and anonymous insider.`,
  },
  {
    label: 'Credible reporting',
    text: `A new study published in the New England Journal of Medicine found that regular moderate exercise — defined as 150 minutes per week — was associated with a 35% reduction in cardiovascular disease risk over a 10-year period. The research, led by Dr. Sarah Chen at Johns Hopkins University, followed 12,000 participants across six countries. "These findings reinforce existing guidelines on physical activity," said Dr. Chen. The study controlled for age, diet, smoking, and pre-existing conditions. Critics noted the observational design limits causal conclusions.`,
  },
]

function VerdictBadge({ verdict }: { verdict: 'FAKE' | 'REAL' | 'UNCERTAIN' }) {
  const config = {
    FAKE: {
      icon: AlertTriangle,
      label: 'Likely Fake',
      bg: 'bg-red-500/15',
      border: 'border-red-500/40',
      text: 'text-red-400',
      glow: 'shadow-red-500/20',
    },
    REAL: {
      icon: CheckCircle,
      label: 'Likely Real',
      bg: 'bg-emerald-500/15',
      border: 'border-emerald-500/40',
      text: 'text-emerald-400',
      glow: 'shadow-emerald-500/20',
    },
    UNCERTAIN: {
      icon: HelpCircle,
      label: 'Uncertain',
      bg: 'bg-amber-500/15',
      border: 'border-amber-500/40',
      text: 'text-amber-400',
      glow: 'shadow-amber-500/20',
    },
  }
  const c = config[verdict]
  const Icon = c.icon
  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${c.bg} ${c.border} shadow-lg ${c.glow}`}>
      <Icon className={`w-5 h-5 ${c.text}`} />
      <span className={`font-bold text-lg ${c.text}`}>{c.label}</span>
    </div>
  )
}

function CredibilityMeter({ score }: { score: number }) {
  const pct = Math.round((score / 10) * 100)
  const color = score >= 7 ? '#10b981' : score >= 4 ? '#f59e0b' : '#ef4444'
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-slate-400 uppercase tracking-wider">Credibility Score</span>
        <span className="text-sm font-bold" style={{ color }}>{score}/10</span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

function ConfidenceMeter({ confidence }: { confidence: number }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-slate-400 uppercase tracking-wider">AI Confidence</span>
        <span className="text-sm font-bold text-slate-300">{confidence}%</span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all duration-700"
          style={{ width: `${confidence}%` }}
        />
      </div>
    </div>
  )
}

function AnalysisCard({ result }: { result: AnalysisResult }) {
  const [showMore, setShowMore] = useState(false)

  return (
    <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden backdrop-blur-sm">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-slate-700/40">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <VerdictBadge verdict={result.verdict} />
          <span className="text-xs font-medium px-3 py-1 bg-slate-700/60 text-slate-300 rounded-full border border-slate-600/40">
            {result.category}
          </span>
        </div>
        <p className="mt-3 text-slate-300 text-sm leading-relaxed">{result.summary}</p>
      </div>

      {/* Meters */}
      <div className="px-6 py-4 border-b border-slate-700/40 space-y-3">
        <CredibilityMeter score={result.credibilityScore} />
        <ConfidenceMeter confidence={result.confidence} />
      </div>

      {/* Reasoning */}
      <div className="px-6 py-4 border-b border-slate-700/40">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Analysis</h3>
        <p className="text-slate-300 text-sm leading-relaxed">{result.reasoning}</p>
      </div>

      {/* Toggle flags */}
      <button
        onClick={() => setShowMore(!showMore)}
        className="w-full px-6 py-3 flex items-center justify-between text-slate-400 hover:text-slate-200 transition-colors text-sm"
      >
        <span>View Indicators ({result.redFlags.length + result.positiveIndicators.length})</span>
        {showMore ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {showMore && (
        <div className="px-6 pb-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {result.redFlags.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">Red Flags</h3>
              <ul className="space-y-1.5">
                {result.redFlags.map((flag, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-red-400 mt-0.5 flex-shrink-0">✗</span>
                    {flag}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.positiveIndicators.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Positive Signs</h3>
              <ul className="space-y-1.5">
                {result.positiveIndicators.map((ind, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span>
                    {ind}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function HistoryPanel({
  history,
  onSelect,
  onClear,
}: {
  history: HistoryItem[]
  onSelect: (item: HistoryItem) => void
  onClear: () => void
}) {
  if (!history.length) return null

  const verdictDot = (v: string) =>
    v === 'FAKE' ? 'bg-red-400' : v === 'REAL' ? 'bg-emerald-400' : 'bg-amber-400'

  return (
    <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recent Analyses</h3>
        <button onClick={onClear} className="text-slate-500 hover:text-slate-300 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="space-y-2">
        {history.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className="w-full text-left px-3 py-2.5 rounded-lg bg-slate-700/30 hover:bg-slate-700/60 border border-slate-700/30 hover:border-slate-600/50 transition-all group"
          >
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${verdictDot(item.result.verdict)}`} />
              <span className="text-xs font-medium text-slate-300 truncate">{item.result.verdict} · {item.result.category}</span>
            </div>
            <p className="text-xs text-slate-500 truncate pl-4">{item.text.slice(0, 60)}…</p>
          </button>
        ))}
      </div>
    </div>
  )
}

function Home() {
  const [text, setText] = useState('')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const resultRef = useRef<HTMLDivElement>(null)

  async function handleAnalyze() {
    if (!text.trim() || loading) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Analysis failed.')
        return
      }

      setResult(data)
      const historyItem: HistoryItem = {
        id: `${Date.now()}`,
        text,
        result: data,
        timestamp: new Date(),
      }
      setHistory((prev) => [historyItem, ...prev].slice(0, 8))

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleExample(article: { label: string; text: string }) {
    setText(article.text)
    setResult(null)
    setError(null)
  }

  function handleHistorySelect(item: HistoryItem) {
    setText(item.text)
    setResult(item.result)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <Newspaper className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="font-bold text-slate-100 leading-none">FakeScope</h1>
            <p className="text-xs text-slate-500 mt-0.5">AI-powered fake news detection</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Input */}
          <div className="lg:col-span-2 space-y-4">
            {/* Hero */}
            {!result && !loading && (
              <div className="text-center py-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-medium mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  Powered by AI
                </div>
                <h2 className="text-3xl font-bold text-slate-100 mb-2">
                  Detect Fake News Instantly
                </h2>
                <p className="text-slate-400 text-sm max-w-md mx-auto">
                  Paste any news article, headline, or social media post. Our AI analyzes language patterns,
                  source credibility signals, and factual consistency.
                </p>
              </div>
            )}

            {/* Examples */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-slate-500 self-center">Try an example:</span>
              {EXAMPLE_ARTICLES.map((ex) => (
                <button
                  key={ex.label}
                  onClick={() => handleExample(ex)}
                  className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-lg text-slate-300 transition-all"
                >
                  {ex.label}
                </button>
              ))}
            </div>

            {/* Input area */}
            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste a news article, headline, or social media post here…"
                rows={9}
                className="w-full bg-slate-800/60 border border-slate-700 focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-4 py-3.5 text-slate-200 placeholder-slate-500 text-sm resize-none outline-none transition-all"
              />
              <div className="absolute bottom-3 right-3 text-xs text-slate-600">
                {text.length} chars
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={!text.trim() || loading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing…
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Analyze Article
                </>
              )}
            </button>

            {/* Result */}
            {result && (
              <div ref={resultRef}>
                <AnalysisCard result={result} />
              </div>
            )}
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-4">
            {/* Info card */}
            <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">How It Works</h3>
              {[
                { icon: '🔍', title: 'Language Analysis', desc: 'Detects sensational, emotional, or manipulative wording' },
                { icon: '📊', title: 'Source Signals', desc: 'Checks for credible citations and verifiable claims' },
                { icon: '⚖️', title: 'Bias Detection', desc: 'Identifies one-sided framing and propaganda patterns' },
                { icon: '✅', title: 'Fact Consistency', desc: 'Flags implausible or internally contradictory claims' },
              ].map((item) => (
                <div key={item.title} className="flex gap-3">
                  <span className="text-lg flex-shrink-0">{item.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-slate-300">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Disclaimer */}
            <div className="px-4 py-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
              <p className="text-xs text-amber-500/80 leading-relaxed">
                <strong>Disclaimer:</strong> This tool assists media literacy but is not infallible.
                Always verify important news from multiple reputable sources.
              </p>
            </div>

            {/* History */}
            <HistoryPanel
              history={history}
              onSelect={handleHistorySelect}
              onClear={() => setHistory([])}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

export const Route = createFileRoute('/')({
  component: Home,
})
