import { Routes, Route, Link, Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import TransactionsPage from './pages/TransactionsPage'
import CategoriesPage from './pages/CategoriesPage'
import BudgetsPage from './pages/BudgetsPage'
import GoalsPage from './pages/GoalsPage'
import CoachPage from './pages/CoachPage'
import SettingsPage from './pages/SettingsPage'

function App() {
  const { token, logout } = useAuth()

  if (!token) return <LoginPage />

  return (
    <div className="app">
      <nav className="sidebar">
        <h2>Expense Guard</h2>
        <Link to="/">Dashboard</Link>
        <Link to="/transactions">Transactions</Link>
        <Link to="/categories">Categories</Link>
        <Link to="/budgets">Budgets</Link>
        <Link to="/goals">Goals</Link>
        <hr />
        <Link to="/coach">AI Advisor</Link>
        <Link to="/settings">Settings</Link>
        <hr />
        <button onClick={logout}>Logout</button>
      </nav>
      <main className="content">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/budgets" element={<BudgetsPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/coach" element={<CoachPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
