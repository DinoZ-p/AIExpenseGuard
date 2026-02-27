import { useState } from 'react'
import { useAuth } from '../AuthContext'
import { loginUser, registerUser } from '../api'

export default function LoginPage() {
  const { login } = useAuth()
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
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="login-page">
      <h1>Expense Guard</h1>
      <h3>{isRegistering ? 'Register' : 'Login'}</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit">{isRegistering ? 'Register' : 'Login'}</button>
      </form>
      <p>
        <a href="#" onClick={(e) => { e.preventDefault(); setIsRegistering(!isRegistering) }}>
          {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
        </a>
      </p>
    </div>
  )
}
