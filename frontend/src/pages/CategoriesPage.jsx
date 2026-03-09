import { useEffect, useState } from 'react'
import { useAuth } from '../AuthContext'
import { getCategories, createCategory, deleteCategory } from '../api'

export default function CategoriesPage() {
  const { token } = useAuth()
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({ name: '', type: 'expense', is_essential: false })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    try {
      setCategories(await getCategories(token))
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [token])

  async function handleAdd(e) {
    e.preventDefault()
    setError('')
    try {
      await createCategory(token, form)
      setForm({ name: '', type: 'expense', is_essential: false })
      load()
    } catch (e) {
      setError(e.message)
    }
  }

  async function handleDelete(id) {
    await deleteCategory(token, id)
    load()
  }

  if (loading) return <div className="loading">Loading categories…</div>

  return (
    <div>
      <h1>Categories</h1>

      <form onSubmit={handleAdd} className="form-row">
        <label>Name
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        </label>
        <label>Type
          <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
            <option value="transfer">Transfer</option>
          </select>
        </label>
        <label>
          <input type="checkbox" checked={form.is_essential} onChange={e => setForm({ ...form, is_essential: e.target.checked })} />
          Essential
        </label>
        <button type="submit">Add</button>
      </form>
      {error && <div className="msg-error">{error}</div>}

      <table>
        <thead><tr><th>Name</th><th>Type</th><th>Essential</th><th></th></tr></thead>
        <tbody>
          {categories.map(c => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.type}</td>
              <td>{c.is_essential ? 'Yes' : 'No'}</td>
              <td><button className="btn-delete" onClick={() => handleDelete(c.id)}>X</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
