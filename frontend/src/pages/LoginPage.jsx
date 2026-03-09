import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { loginUser, registerUser } from '../api'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      if (isRegistering) {
        await registerUser(email, password)
      }
      const data = await loginUser(email, password)
      login(data.access_token)
      navigate('/')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="login-page">
      <div className="card">
        <div className="login-logo">Expense Guard</div>
        <div className="login-subtitle">Personal finance, simplified</div>
        <h3 style={{ textAlign: 'center', marginBottom: 20 }}>{isRegistering ? 'Create account' : 'Sign in'}</h3>
        {error && <div className="msg-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit" className="btn-primary">{isRegistering ? 'Register' : 'Login'}</button>
        </form>
        <div className="login-toggle">
          {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
          <a href="#" onClick={e => { e.preventDefault(); setIsRegistering(!isRegistering); setError('') }}>
            {isRegistering ? 'Sign in' : 'Register'}
          </a>
        </div>
      </div>
    </div>
  )
}
