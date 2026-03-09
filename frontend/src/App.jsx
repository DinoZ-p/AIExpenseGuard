import { Routes, Route, NavLink, Navigate } from 'react-router-dom'
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
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/transactions">Transactions</NavLink>
        <NavLink to="/categories">Categories</NavLink>
        <NavLink to="/budgets">Budgets</NavLink>
        <NavLink to="/goals">Goals</NavLink>
        <hr />
        <NavLink to="/coach">AI Advisor</NavLink>
        <NavLink to="/settings">Settings</NavLink>
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
