import { useEffect, useState } from 'react'
import { useAuth } from '../AuthContext'
import { getGoals, createGoal, deleteGoal, getGoalProjection } from '../api'

export default function GoalsPage() {
  const { token } = useAuth()
  const [goals, setGoals] = useState([])
  const [projections, setProjections] = useState({})
  const [form, setForm] = useState({
    title: '', target_amount: '', target_date: '', priority: '3', type: 'mid'
  })

  function load() { getGoals(token).then(setGoals) }
  useEffect(() => { load() }, [token])

  async function handleAdd(e) {
    e.preventDefault()
    await createGoal(token, {
      ...form,
      target_amount: parseFloat(form.target_amount),
      priority: parseInt(form.priority),
    })
    setForm({ title: '', target_amount: '', target_date: '', priority: '3', type: 'mid' })
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

  return (
    <div>
      <h1>Goals</h1>

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

      <table>
        <thead>
          <tr><th>Title</th><th>Target</th><th>Current</th><th>Target Date</th><th>Priority</th><th>Type</th><th></th><th></th></tr>
        </thead>
        <tbody>
          {goals.map(g => (
            <>
              <tr key={g.id}>
                <td>{g.title}</td>
                <td>${g.target_amount.toFixed(2)}</td>
                <td>${g.current_amount.toFixed(2)}</td>
                <td>{g.target_date}</td>
                <td>{g.priority}</td>
                <td>{g.type}</td>
                <td><button onClick={() => handleProjection(g.id)}>Projection</button></td>
                <td><button className="btn-delete" onClick={() => handleDelete(g.id)}>X</button></td>
              </tr>
              {projections[g.id] && (
                <tr key={`proj-${g.id}`}>
                  <td colSpan={8}>
                    <div className="projection">
                      {projections[g.id].on_track
                        ? <strong style={{color:'green'}}>On track!</strong>
                        : <strong style={{color:'red'}}>Off track by {projections[g.id].days_behind} days</strong>
                      }
                      {' | '}Projected: {projections[g.id].projected_completion_date || 'N/A'}
                      {' | '}Avg monthly savings: ${projections[g.id].avg_monthly_savings}
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
          ))}
        </tbody>
      </table>
    </div>
  )
}
