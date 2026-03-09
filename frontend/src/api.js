async function apiFetch(path, token, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(path, { ...options, headers })
  if (res.status === 401) throw new Error('Unauthorized')
  if (res.status === 204) return null
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || 'Request failed')
  }
  return res.json()
}

function buildQs(params) {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([_, v]) => v))
  ).toString()
  return qs ? '?' + qs : ''
}

// Auth
export function registerUser(email, password) {
  return apiFetch('/auth/register', null, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function loginUser(email, password) {
  return fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ username: email, password }),
  }).then(r => {
    if (!r.ok) throw new Error('Invalid credentials')
    return r.json()
  })
}

// User
export const getMe = (token) => apiFetch('/auth/me', token)
export const updateMonthlySavings = (token, amount) =>
  apiFetch('/auth/savings', token, { method: 'PUT', body: JSON.stringify({ monthly_savings: amount }) })

// Categories
export const getCategories = (token) => apiFetch('/categories/', token)
export const createCategory = (token, data) =>
  apiFetch('/categories/', token, { method: 'POST', body: JSON.stringify(data) })
export const deleteCategory = (token, id) =>
  apiFetch(`/categories/${id}`, token, { method: 'DELETE' })

// Transactions
export const getTransactions = (token, params = {}) =>
  apiFetch(`/transactions/${buildQs(params)}`, token)
export const createTransaction = (token, data) =>
  apiFetch('/transactions/', token, { method: 'POST', body: JSON.stringify(data) })
export const updateTransaction = (token, id, data) =>
  apiFetch(`/transactions/${id}`, token, { method: 'PATCH', body: JSON.stringify(data) })
export const deleteTransaction = (token, id) =>
  apiFetch(`/transactions/${id}`, token, { method: 'DELETE' })
export const importCSV = (token, file) => {
  const formData = new FormData()
  formData.append('file', file)
  return fetch('/transactions/import-csv', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  }).then(r => r.json())
}
export function exportTransactions(token, params = {}) {
  const qs = buildQs(params)
  const url = `/transactions/export${qs}`
  return fetch(url, { headers: { 'Authorization': `Bearer ${token}` } })
    .then(r => r.blob())
    .then(blob => {
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = 'transactions.csv'
      a.click()
    })
}

// Budgets
export const getBudgets = (token) => apiFetch('/budgets/', token)
export const createBudget = (token, data) =>
  apiFetch('/budgets/', token, { method: 'POST', body: JSON.stringify(data) })
export const updateBudget = (token, id, data) =>
  apiFetch(`/budgets/${id}`, token, { method: 'PATCH', body: JSON.stringify(data) })
export const deleteBudget = (token, id) =>
  apiFetch(`/budgets/${id}`, token, { method: 'DELETE' })

// Goals
export const getGoals = (token) => apiFetch('/goals/', token)
export const createGoal = (token, data) =>
  apiFetch('/goals/', token, { method: 'POST', body: JSON.stringify(data) })
export const updateGoal = (token, id, data) =>
  apiFetch(`/goals/${id}`, token, { method: 'PATCH', body: JSON.stringify(data) })
export const deleteGoal = (token, id) =>
  apiFetch(`/goals/${id}`, token, { method: 'DELETE' })

// Analytics
export const getSpending = (token, params = {}) =>
  apiFetch(`/analytics/spending${buildQs(params)}`, token)
export const getOverspend = (token) => apiFetch('/analytics/overspend', token)
export const getGoalProjection = (token, goalId) =>
  apiFetch(`/analytics/goal-projection/${goalId}`, token)
export const getReport = (token) => apiFetch('/analytics/report', token)

// Rules
export const getAlerts = (token) => apiFetch('/rules/alerts', token)

// Advisor
export const chatWithAdvisor = (token, question, history) =>
  apiFetch('/advisor/chat', token, { method: 'POST', body: JSON.stringify({ question, history }) })
export const getMonthlyTrend = (token, months = 6) => apiFetch('/analytics/monthly-trend?months=' + months, token)
export const changePassword = (token, current_password, new_password) => apiFetch('/auth/password', token, { method: 'PUT', body: JSON.stringify({ current_password, new_password }) })
