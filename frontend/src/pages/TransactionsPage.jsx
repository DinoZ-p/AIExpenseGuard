import { useEffect, useState } from 'react'
import { useAuth } from '../AuthContext'
import { getTransactions, createTransaction, deleteTransaction, updateTransaction, importCSV, exportTransactions, getCategories } from '../api'

const PAGE_SIZE = 50

export default function TransactionsPage() {
  const { token } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [csvFile, setCsvFile] = useState(null)
  const [importMsg, setImportMsg] = useState('')
  const [editing, setEditing] = useState({})
  const [page, setPage] = useState(0)
  const [form, setForm] = useState({
    category_id: '', amount: '', direction: 'expense', date: '', merchant: '', note: ''
  })
  const [filters, setFilters] = useState({
    category_id: '', direction: '', start_date: '', end_date: '', merchant: ''
  })

  function load(pg = page) {
    const params = {
      skip: pg * PAGE_SIZE,
      limit: PAGE_SIZE,
      ...(filters.category_id && { category_id: filters.category_id }),
      ...(filters.direction && { direction: filters.direction }),
      ...(filters.start_date && { start_date: filters.start_date }),
      ...(filters.end_date && { end_date: filters.end_date }),
      ...(filters.merchant && { merchant: filters.merchant }),
    }
    getTransactions(token, params).then(setTransactions)
    getCategories(token).then(setCategories)
  }

  useEffect(() => { load(0); setPage(0) }, [token])

  function applyFilters(e) {
    e.preventDefault()
    setPage(0)
    load(0)
  }

  function clearFilters() {
    const empty = { category_id: '', direction: '', start_date: '', end_date: '', merchant: '' }
    setFilters(empty)
    setPage(0)
    getTransactions(token, { skip: 0, limit: PAGE_SIZE }).then(setTransactions)
  }

  function goPage(newPage) {
    setPage(newPage)
    load(newPage)
  }

  async function handleAdd(e) {
    e.preventDefault()
    await createTransaction(token, {
      ...form,
      category_id: parseInt(form.category_id),
      amount: parseFloat(form.amount),
    })
    setForm({ category_id: '', amount: '', direction: 'expense', date: '', merchant: '', note: '' })
    load()
  }

  async function handleDelete(id) {
    await deleteTransaction(token, id)
    load()
  }

  async function handleUpload() {
    if (!csvFile) return
    const result = await importCSV(token, csvFile)
    setImportMsg(`Imported ${result.imported} transactions, ${result.errors.length} errors`)
    setCsvFile(null)
    load()
  }

  function startEdit(t) {
    setEditing(prev => ({
      ...prev,
      [t.id]: { category_id: t.category_id.toString(), amount: t.amount.toString(),
        direction: t.direction, date: t.date, merchant: t.merchant || '', note: t.note || '' }
    }))
  }

  function cancelEdit(id) {
    setEditing(prev => { const c = { ...prev }; delete c[id]; return c })
  }

  async function saveEdit(id) {
    const e = editing[id]
    await updateTransaction(token, id, {
      category_id: parseInt(e.category_id), amount: parseFloat(e.amount),
      direction: e.direction, date: e.date, merchant: e.merchant, note: e.note,
    })
    cancelEdit(id)
    load()
  }

  const catName = (id) => categories.find(c => c.id === id)?.name || id || 'Uncategorized'

  return (
    <div>
      <h1>Transactions</h1>

      <h3>Add Transaction</h3>
      <form onSubmit={handleAdd} className="form-row">
        <label>Category
          <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} required>
            <option value="">Select...</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label>Amount
          <input type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
        </label>
        <label>Direction
          <select value={form.direction} onChange={e => setForm({ ...form, direction: e.target.value })}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </label>
        <label>Date
          <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
        </label>
        <label>Merchant
          <input value={form.merchant} onChange={e => setForm({ ...form, merchant: e.target.value })} />
        </label>
        <label>Note
          <input value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
        </label>
        <button type="submit">Add</button>
      </form>

      <h3>Import CSV</h3>
      <div className="form-row">
        <input type="file" accept=".csv" onChange={e => setCsvFile(e.target.files[0])} />
        <button onClick={handleUpload}>Upload</button>
        {importMsg && <span>{importMsg}</span>}
      </div>

      <h3>Filter</h3>
      <form onSubmit={applyFilters} className="form-row">
        <label>Category
          <select value={filters.category_id} onChange={e => setFilters({ ...filters, category_id: e.target.value })}>
            <option value="">All</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label>Direction
          <select value={filters.direction} onChange={e => setFilters({ ...filters, direction: e.target.value })}>
            <option value="">All</option>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </label>
        <label>From
          <input type="date" value={filters.start_date} onChange={e => setFilters({ ...filters, start_date: e.target.value })} />
        </label>
        <label>To
          <input type="date" value={filters.end_date} onChange={e => setFilters({ ...filters, end_date: e.target.value })} />
        </label>
        <label>Merchant
          <input value={filters.merchant} placeholder="Search..." onChange={e => setFilters({ ...filters, merchant: e.target.value })} />
        </label>
        <button type="submit">Apply</button>
        <button type="button" onClick={clearFilters}>Clear</button>
      </form>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
        <h3>Results ({transactions.length}{transactions.length === PAGE_SIZE ? '+' : ''})</h3>
        <button onClick={() => exportTransactions(token)}>Export CSV</button>
      </div>
      <table>
        <thead>
          <tr><th>Date</th><th>Category</th><th>Amount</th><th>Direction</th><th>Merchant</th><th>Note</th><th></th></tr>
        </thead>
        <tbody>
          {transactions.map(t => {
            const e = editing[t.id]
            return e ? (
              <tr key={t.id}>
                <td><input type="date" value={e.date} onChange={ev => setEditing(prev => ({ ...prev, [t.id]: { ...prev[t.id], date: ev.target.value } }))} style={{ width: 130 }} /></td>
                <td><select value={e.category_id} onChange={ev => setEditing(prev => ({ ...prev, [t.id]: { ...prev[t.id], category_id: ev.target.value } }))}>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select></td>
                <td><input type="number" step="0.01" value={e.amount} onChange={ev => setEditing(prev => ({ ...prev, [t.id]: { ...prev[t.id], amount: ev.target.value } }))} style={{ width: 80 }} /></td>
                <td><select value={e.direction} onChange={ev => setEditing(prev => ({ ...prev, [t.id]: { ...prev[t.id], direction: ev.target.value } }))}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select></td>
                <td><input value={e.merchant} onChange={ev => setEditing(prev => ({ ...prev, [t.id]: { ...prev[t.id], merchant: ev.target.value } }))} style={{ width: 100 }} /></td>
                <td><input value={e.note} onChange={ev => setEditing(prev => ({ ...prev, [t.id]: { ...prev[t.id], note: ev.target.value } }))} style={{ width: 100 }} /></td>
                <td style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => saveEdit(t.id)}>Save</button>
                  <button onClick={() => cancelEdit(t.id)}>Cancel</button>
                </td>
              </tr>
            ) : (
              <tr key={t.id}>
                <td>{t.date}</td>
                <td>{catName(t.category_id)}</td>
                <td>${t.amount.toFixed(2)}</td>
                <td>{t.direction}</td>
                <td>{t.merchant}</td>
                <td>{t.note}</td>
                <td style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => startEdit(t)}>Edit</button>
                  <button className="btn-delete" onClick={() => handleDelete(t.id)}>X</button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className="form-row" style={{ marginTop: 8 }}>
        <button onClick={() => goPage(page - 1)} disabled={page === 0}>Previous</button>
        <span style={{ padding: '0 8px', alignSelf: 'center' }}>Page {page + 1}</span>
        <button onClick={() => goPage(page + 1)} disabled={transactions.length < PAGE_SIZE}>Next</button>
      </div>
    </div>
  )
}
