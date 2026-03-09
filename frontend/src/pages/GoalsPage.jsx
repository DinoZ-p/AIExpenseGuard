import { useEffect, useState } from 'react'
import { useAuth } from '../AuthContext'
import { getGoals, createGoal, updateGoal, deleteGoal, getGoalProjection, getMe, updateMonthlySavings } from '../api'

export default function GoalsPage() {
  const { token } = useAuth()
  const [goals, setGoals] = useState([])
  const [projections, setProjections] = useState({})
  const [monthlySavings, setMonthlySavings] = useState('')
  const [savedAmount, setSavedAmount] = useState(0)
  const [editingAmount, setEditingAmount] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '', target_amount: '', target_date: '', priority: '3', type: 'mid'
  })

  async function load() {
    setLoading(true)
    try {
      const [goalsData, user] = await Promise.all([getGoals(token), getMe(token)])
      setGoals(goalsData)
      setMonthlySavings(user.monthly_savings.toString())
      setSavedAmount(user.monthly_savings)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [token])

  async function handleSaveSavings(e) {
    e.preventDefault()
    const amount = parseFloat(monthlySavings)
    if (isNaN(amount) || amount < 0) return
    await updateMonthlySavings(token, amount)
    setSavedAmount(amount)
    setProjections({})
  }

  async function handleAdd(e) {
    e.preventDefault()
    setError('')
    try {
      await createGoal(token, {
        ...form,
        target_amount: parseFloat(form.target_amount),
        priority: parseInt(form.priority),
      })
      setForm({ title: '', target_amount: '', target_date: '', priority: '3', type: 'mid' })
      load()
    } catch (e) {
      setError(e.message)
    }
  }

  async function handleUpdateAmount(goalId) {
    const val = parseFloat(editingAmount[goalId])
    if (isNaN(val) || val < 0) return
    await updateGoal(token, goalId, { current_amount: val })
    setEditingAmount(prev => { const c = { ...prev }; delete c[goalId]; return c })
    setProjections(prev => { const c = { ...prev }; delete c[goalId]; return c })
    load()
  }

  async function handleDelete(id) {
    await deleteGoal(token, id)
    setProjections(prev => { const copy = { ...prev }; delete copy[id]; return copy })
    load()
  }

  async function handleProjection(goalId) {
    const result = await getGoalProjection(token, goalId)
    setProjections(prev => ({ ...prev, [goalId]: result }))
  }

  if (loading) return <div className="loading">Loading goals…</div>

  return (
    <div>
      <h1>Goals</h1>

      <div className="card">
        <h3>Monthly Savings</h3>
        <form onSubmit={handleSaveSavings} className="form-row">
          <label>How much do you save per month?
            <input type="number" step="0.01" value={monthlySavings}
              onChange={e => setMonthlySavings(e.target.value)} required />
          </label>
          <button type="submit">Save</button>
          {savedAmount > 0 && <span>Current: ${savedAmount.toFixed(2)}/mo</span>}
        </form>
      </div>

      <h3>Add Goal</h3>
      <form onSubmit={handleAdd} className="form-row">
        <label>Title
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
        </label>
        <label>Target Amount
          <input type="number" step="0.01" value={form.target_amount} onChange={e => setForm({ ...form, target_amount: e.target.value })} required />
        </label>
        <label>Target Date
          <input type="date" value={form.target_date} onChange={e => setForm({ ...form, target_date: e.target.value })} required />
        </label>
        <label>Priority (1-5)
          <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
            {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <label>Type
          <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            <option value="short">Short</option>
            <option value="mid">Mid</option>
            <option value="long">Long</option>
          </select>
        </label>
        <button type="submit">Add</button>
      </form>
      {error && <div className="msg-error">{error}</div>}

      <table>
        <thead>
          <tr><th>Title</th><th>Progress</th><th>Target</th><th>Current</th><th>Target Date</th><th>Priority</th><th>Type</th><th></th><th></th></tr>
        </thead>
        <tbody>
          {goals.map(g => {
            const pct = g.target_amount > 0 ? Math.min((g.current_amount / g.target_amount) * 100, 100) : 0
            return (
              <>
                <tr key={g.id}>
                  <td>{g.title}</td>
                  <td style={{ minWidth: 120 }}>
                    <div className="goal-progress-wrap">
                      <div className="goal-progress-bar" style={{ width: `${pct}%` }} />
                    </div>
                    <span style={{ fontSize: '0.8em', color: '#555' }}>{pct.toFixed(0)}%</span>
                  </td>
                  <td>${g.target_amount.toFixed(2)}</td>
                  <td>
                    {editingAmount[g.id] !== undefined ? (
                      <span style={{ display: 'flex', gap: 4 }}>
                        <input type="number" step="0.01" style={{ width: 80 }}
                          value={editingAmount[g.id]}
                          onChange={e => setEditingAmount(prev => ({ ...prev, [g.id]: e.target.value }))} />
                        <button onClick={() => handleUpdateAmount(g.id)}>Save</button>
                        <button onClick={() => setEditingAmount(prev => { const c = { ...prev }; delete c[g.id]; return c })}>Cancel</button>
                      </span>
                    ) : (
                      <span onClick={() => setEditingAmount(prev => ({ ...prev, [g.id]: g.current_amount.toString() }))}
                        style={{ cursor: 'pointer', textDecoration: 'underline dotted' }}
                        title="Click to edit">
                        ${g.current_amount.toFixed(2)}
                      </span>
                    )}
                  </td>
                  <td>{g.target_date}</td>
                  <td>{g.priority}</td>
                  <td>{g.type}</td>
                  <td><button onClick={() => handleProjection(g.id)}>Projection</button></td>
                  <td><button className="btn-delete" onClick={() => handleDelete(g.id)}>X</button></td>
                </tr>
                {projections[g.id] && (
                  <tr key={`proj-${g.id}`}>
                    <td colSpan={9}>
                      <div className="projection">
                        {projections[g.id].on_track
                          ? <strong style={{color:'green'}}>On track!</strong>
                          : <strong style={{color:'red'}}>Off track by {projections[g.id].days_behind} days</strong>
                        }
                        {' | '}Projected: {projections[g.id].projected_completion_date || 'N/A'}
                        {' | '}Your share: ${projections[g.id].monthly_share}/mo (priority {projections[g.id].priority} of {projections[g.id].total_priority} total)
                        {' | '}Remaining: ${projections[g.id].remaining}
                        {projections[g.id].required_monthly_to_hit_target &&
                          <span> | Need ${projections[g.id].required_monthly_to_hit_target}/mo to hit target</span>
                        }
                        {projections[g.id].message && <span> | {projections[g.id].message}</span>}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
