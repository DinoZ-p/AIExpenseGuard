import { useState } from 'react'
import { useAuth } from '../AuthContext'
import { changePassword } from '../api'

export default function SettingsPage() {
  const { token } = useAuth()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setMsg('')
    setError('')
    if (next !== confirm) {
      setError('New passwords do not match')
      return
    }
    if (next.length < 6) {
      setError('New password must be at least 6 characters')
      return
    }
    try {
      await changePassword(token, current, next)
      setMsg('Password changed successfully')
      setCurrent('')
      setNext('')
      setConfirm('')
    } catch (e) {
      setError(e.message || 'Failed to change password')
    }
  }

  return (
    <div>
      <h1>Settings</h1>
      <div className="card" style={{ maxWidth: 360 }}>
        <h3>Change Password</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
          <label style={{ display: 'flex', flexDirection: 'column', fontSize: '0.85em' }}>
            Current Password
            <input type="password" value={current} onChange={e => setCurrent(e.target.value)} required />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', fontSize: '0.85em' }}>
            New Password
            <input type="password" value={next} onChange={e => setNext(e.target.value)} required />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', fontSize: '0.85em' }}>
            Confirm New Password
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
          </label>
          {error && <p style={{ color: 'red', fontSize: '0.85em' }}>{error}</p>}
          {msg && <p style={{ color: 'green', fontSize: '0.85em' }}>{msg}</p>}
          <button type="submit">Change Password</button>
        </form>
      </div>
    </div>
  )
}
