import { useEffect, useState } from 'react'
import { useAuth } from '../AuthContext'
import { getBudgets, createBudget, deleteBudget, updateBudget, getCategories } from '../api'

export default function BudgetsPage() {
  const { token } = useAuth()
  const [budgets, setBudgets] = useState([])
  const [categories, setCategories] = useState([])
  const [editing, setEditing] = useState({})
  const [form, setForm] = useState({ category_id: '', period: 'monthly', limit_amount: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    try {
      const [b, c] = await Promise.all([getBudgets(token), getCategories(token)])
      setBudgets(b)
      setCategories(c)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [token])

  async function handleAdd(e) {
    e.preventDefault()
    setError('')
    try {
      await createBudget(token, {
        ...form,
        category_id: parseInt(form.category_id),
        limit_amount: parseFloat(form.limit_amount),
      })
      setForm({ category_id: '', period: 'monthly', limit_amount: '' })
      load()
    } catch (e) {
      setError(e.message)
    }
  }

  async function handleDelete(id) {
    await deleteBudget(token, id)
    load()
  }

  function startEdit(b) {
    setEditing(prev => ({ ...prev, [b.id]: { period: b.period, limit_amount: b.limit_amount.toString() } }))
  }

  function cancelEdit(id) {
    setEditing(prev => { const c = { ...prev }; delete c[id]; return c })
  }

  async function saveEdit(id) {
    const e = editing[id]
    await updateBudget(token, id, { period: e.period, limit_amount: parseFloat(e.limit_amount) })
    cancelEdit(id)
    load()
  }

  const catName = (id) => categories.find(c => c.id === id)?.name || id

  if (loading) return <div className="loading">Loading budgets…</div>

  return (
    <div>
      <h1>Budgets</h1>

      <form onSubmit={handleAdd} className="form-row">
        <label>Category
          <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} required>
            <option value="">Select...</option>
            {categories.filter(c => c.type === 'expense').map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        <label>Period
          <select value={form.period} onChange={e => setForm({ ...form, period: e.target.value })}>
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
          </select>
        </label>
        <label>Limit
          <input type="number" step="0.01" value={form.limit_amount} onChange={e => setForm({ ...form, limit_amount: e.target.value })} required />
        </label>
        <button type="submit">Add</button>
      </form>
      {error && <div className="msg-error">{error}</div>}

      <table>
        <thead><tr><th>Category</th><th>Period</th><th>Limit</th><th></th></tr></thead>
        <tbody>
          {budgets.map(b => {
            const e = editing[b.id]
            return e ? (
              <tr key={b.id}>
                <td>{catName(b.category_id)}</td>
                <td>
                  <select value={e.period} onChange={ev => setEditing(prev => ({ ...prev, [b.id]: { ...prev[b.id], period: ev.target.value } }))}>
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </td>
                <td>
                  <input type="number" step="0.01" value={e.limit_amount} style={{ width: 90 }}
                    onChange={ev => setEditing(prev => ({ ...prev, [b.id]: { ...prev[b.id], limit_amount: ev.target.value } }))} />
                </td>
                <td style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => saveEdit(b.id)}>Save</button>
                  <button onClick={() => cancelEdit(b.id)}>Cancel</button>
                </td>
              </tr>
            ) : (
              <tr key={b.id}>
                <td>{catName(b.category_id)}</td>
                <td>{b.period}</td>
                <td>${b.limit_amount.toFixed(2)}</td>
                <td style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => startEdit(b)}>Edit</button>
                  <button className="btn-delete" onClick={() => handleDelete(b.id)}>X</button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
