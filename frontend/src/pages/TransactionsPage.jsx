import { useEffect, useState } from 'react'
import { useAuth } from '../AuthContext'
import { getTransactions, createTransaction, deleteTransaction, importCSV, getCategories } from '../api'

export default function TransactionsPage() {
  const { token } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [csvFile, setCsvFile] = useState(null)
  const [importMsg, setImportMsg] = useState('')
  const [form, setForm] = useState({
    category_id: '', amount: '', direction: 'expense', date: '', merchant: '', note: ''
  })

  function load() {
    getTransactions(token).then(setTransactions)
    getCategories(token).then(setCategories)
  }

  useEffect(() => { load() }, [token])

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

      <h3>All Transactions ({transactions.length})</h3>
      <table>
        <thead>
          <tr><th>Date</th><th>Category</th><th>Amount</th><th>Direction</th><th>Merchant</th><th>Note</th><th></th></tr>
        </thead>
        <tbody>
          {transactions.map(t => (
            <tr key={t.id}>
              <td>{t.date}</td>
              <td>{catName(t.category_id)}</td>
              <td>${t.amount.toFixed(2)}</td>
              <td>{t.direction}</td>
              <td>{t.merchant}</td>
              <td>{t.note}</td>
              <td><button className="btn-delete" onClick={() => handleDelete(t.id)}>X</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
