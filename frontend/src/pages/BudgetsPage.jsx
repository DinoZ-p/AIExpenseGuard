import { useEffect, useState } from 'react'
import { useAuth } from '../AuthContext'
import { getBudgets, createBudget, deleteBudget, getCategories } from '../api'

export default function BudgetsPage() {
  const { token } = useAuth()
  const [budgets, setBudgets] = useState([])
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({ category_id: '', period: 'monthly', limit_amount: '' })

  function load() {
    getBudgets(token).then(setBudgets)
    getCategories(token).then(setCategories)
  }
  useEffect(() => { load() }, [token])

  async function handleAdd(e) {
    e.preventDefault()
    await createBudget(token, {
      ...form,
      category_id: parseInt(form.category_id),
      limit_amount: parseFloat(form.limit_amount),
    })
    setForm({ category_id: '', period: 'monthly', limit_amount: '' })
    load()
  }

  async function handleDelete(id) {
    await deleteBudget(token, id)
    load()
  }

  const catName = (id) => categories.find(c => c.id === id)?.name || id

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

      <table>
        <thead><tr><th>Category</th><th>Period</th><th>Limit</th><th></th></tr></thead>
        <tbody>
          {budgets.map(b => (
            <tr key={b.id}>
              <td>{catName(b.category_id)}</td>
              <td>{b.period}</td>
              <td>${b.limit_amount.toFixed(2)}</td>
              <td><button className="btn-delete" onClick={() => handleDelete(b.id)}>X</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
