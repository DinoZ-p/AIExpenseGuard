# Expense Guard

Track expenses, budgets, and goals. Get analytics on your spending. Built with FastAPI + PostgreSQL + React.

## Features

- User auth (JWT)
- CRUD for categories, transactions, budgets, goals
- CSV import for bank statements
- Analytics - savings rate, spending breakdown, overspend alerts, goal projections
- Rules engine - automated alerts for budget issues

## How to run

### 1. Setup

```bash
cd AIExpenseGuard
python -m venv venv
```

Activate venv:
- Windows: `venv\Scripts\activate`
- Mac/Linux: `source venv/bin/activate`

```bash
pip install -r requirements.txt
```

### 2. Database

Create a PostgreSQL database called `spendingtrack`, then create a `.env` file:

```
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/spendingtrack
SECRET_KEY=your-secret-key-change-this
```

Run migrations:

```bash
alembic upgrade head
```

Optionally seed demo data:

```bash
python -m scripts.seed
```

### 3. Run

**Backend:**
```bash
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. API docs at `http://localhost:8000/docs`.

Demo login: `demo@test.com` / `demo123`

## Tests

```bash
pytest -v
```
