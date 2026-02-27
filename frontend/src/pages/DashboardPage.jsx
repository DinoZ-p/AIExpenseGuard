import { useEffect, useState } from 'react'
import { useAuth } from '../AuthContext'
import { getSpending, getAlerts } from '../api'

export default function DashboardPage() {
  const { token } = useAuth()
  const [spending, setSpending] = useState([])
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    getSpending(token).then(setSpending)
    getAlerts(token).then(setAlerts)
  }, [token])

  return (
    <div>
      <h1>Dashboard</h1>

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
      <table>
        <thead><tr><th>Category</th><th>Amount</th><th>Essential</th></tr></thead>
        <tbody>
          {spending.map(s => (
            <tr key={s.category_id}>
              <td>{s.category_name}</td>
              <td>${s.total.toFixed(2)}</td>
              <td>{s.is_essential ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
