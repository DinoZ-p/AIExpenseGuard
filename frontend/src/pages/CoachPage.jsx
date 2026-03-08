import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../AuthContext'
import { chatWithAdvisor } from '../api'

const SUGGESTIONS = [
  "How am I doing with my budget?",
  "Am I on track with my goals?",
  "Where should I cut spending?",
  "How can I reach my goals faster?",
]

export default function CoachPage() {
  const { token } = useAuth()
  const [history, setHistory] = useState([])  // { role, content }
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history, loading])

  async function send(question) {
    const q = question || input.trim()
    if (!q) return
    setInput('')
    setError('')

    const newHistory = [...history, { role: 'user', content: q }]
    setHistory(newHistory)
    setLoading(true)

    try {
      const res = await chatWithAdvisor(token, q, history)
      setHistory([...newHistory, { role: 'assistant', content: res.answer }])
    } catch (e) {
      setError(e.message || 'Failed to get response')
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 40px)' }}>
      <h1>AI Advisor</h1>
      <p style={{ color: '#666', fontSize: '0.9em', margin: '4px 0 12px' }}>
        Ask anything about your spending, goals, or budgets.
      </p>

      {history.length === 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => send(s)}
              style={{ fontSize: '0.85em', padding: '6px 10px' }}>
              {s}
            </button>
          ))}
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #ddd', borderRadius: 4, padding: 12, background: '#fafafa', marginBottom: 12 }}>
        {history.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            marginBottom: 10,
          }}>
            <div style={{
              maxWidth: '75%',
              padding: '8px 12px',
              borderRadius: 8,
              background: msg.role === 'user' ? '#007bff' : '#fff',
              color: msg.role === 'user' ? '#fff' : '#333',
              border: msg.role === 'assistant' ? '1px solid #ddd' : 'none',
              whiteSpace: 'pre-wrap',
              fontSize: '0.9em',
              lineHeight: 1.5,
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ color: '#999', fontSize: '0.85em', fontStyle: 'italic' }}>Thinking...</div>
        )}
        {error && <div style={{ color: 'red', fontSize: '0.85em' }}>{error}</div>}
        <div ref={bottomRef} />
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question... (Enter to send)"
          rows={2}
          style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #ccc', resize: 'none', fontFamily: 'inherit' }}
        />
        <button onClick={() => send()} disabled={loading || !input.trim()}
          style={{ padding: '0 16px' }}>
          Send
        </button>
      </div>
    </div>
  )
}
