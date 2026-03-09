import { useEffect, useState } from 'react'
import { useAuth } from '../AuthContext'
import { getSpending, getAlerts, getMonthlyTrend } from '../api'

function getDefaultDates() {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 30)
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  }
}

export default function DashboardPage() {
  const { token } = useAuth()
  const defaults = getDefaultDates()
  const [startDate, setStartDate] = useState(defaults.start)
  const [endDate, setEndDate] = useState(defaults.end)
  const [spending, setSpending] = useState([])
  const [alerts, setAlerts] = useState([])
  const [trend, setTrend] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const [s, a, t] = await Promise.all([
        getSpending(token, { start_date: startDate, end_date: endDate }),
        getAlerts(token),
        getMonthlyTrend(token),
      ])
      setSpending(s)
      setAlerts(a)
      setTrend(t)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [token])

  const maxSpend = Math.max(...spending.map(s => s.total), 1)
  const totalSpent = spending.reduce((sum, s) => sum + s.total, 0)
  const essentialSpent = spending.filter(s => s.is_essential).reduce((sum, s) => sum + s.total, 0)
  const nonEssentialSpent = totalSpent - essentialSpent
  const maxTrend = Math.max(...trend.map(t => t.total), 1)

  if (loading) return <div className="loading">Loading dashboard…</div>

  return (
    <div>
      <h1>Dashboard</h1>

      <div className="form-row" style={{ marginBottom: 16 }}>
        <label>From
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </label>
        <label>To
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </label>
        <button onClick={load}>Apply</button>
      </div>

      <div className="summary-row">
        <div className="card summary-card">
          <div className="summary-label">Total Spent</div>
          <div className="summary-value">${totalSpent.toFixed(0)}</div>
        </div>
        <div className="card summary-card">
          <div className="summary-label">Essential</div>
          <div className="summary-value" style={{ color: '#28a745' }}>${essentialSpent.toFixed(0)}</div>
        </div>
        <div className="card summary-card">
          <div className="summary-label">Non-Essential</div>
          <div className="summary-value" style={{ color: '#dc3545' }}>${nonEssentialSpent.toFixed(0)}</div>
        </div>
        <div className="card summary-card">
          <div className="summary-label">Alerts</div>
          <div className="summary-value" style={{ color: alerts.length > 0 ? '#dc3545' : '#28a745' }}>{alerts.length}</div>
        </div>
      </div>

      {alerts.length > 0 && (
        <div>
          <h3>Alerts</h3>
          {alerts.map((a, i) => (
            <div key={i} className={`card alert-${a.severity}`}>
              <strong>{a.rule}</strong>: {a.message}
            </div>
          ))}
        </div>
      )}

      <h3>Spending by Category</h3>
      <div className="card">
        {spending.filter(s => s.total > 0).map(s => (
          <div key={s.category_id} className="bar-row">
            <span className="bar-label">{s.category_name}</span>
            <div
              className={`bar ${s.is_essential ? 'bar-essential' : ''}`}
              style={{ width: `${(s.total / maxSpend) * 300}px` }}
            />
            <span className="bar-value">${s.total.toFixed(0)}</span>
          </div>
        ))}
      </div>

      {trend.length > 0 && (
        <>
          <h3>Monthly Spending Trend</h3>
          <div className="card">
            <div className="trend-chart">
              {trend.map(t => (
                <div key={t.month} className="trend-col">
                  <span className="trend-value">${t.total.toFixed(0)}</span>
                  <div className="trend-bar-wrap">
                    <div className="trend-bar" style={{ height: `${(t.total / maxTrend) * 120}px` }} />
                  </div>
                  <span className="trend-label">{t.month}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
