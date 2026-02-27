

A financial huard API that tracks expenses, budgets, goals, and gives you analytics on your spending habits. Built with FastAPI + PostgreSQL + React.

## What it does

- **User auth** - Register and login with JWT tokens. All data is scoped per user so nobody sees your stuff.
- **CRUD for everything** - Categories, transactions, goals, budgets. Create, list, delete.
- **CSV import** - Upload a bank statement CSV (Chase, Amex, Mint format) and it auto-imports all transactions.
- **Analytics engine** - Savings rate, spending by category, overspend alerts, goal projections.
- **Rules engine** - Automated alerts when you're over budget, savings rate is low, goals are off track, etc.
- **Goal tracking** - Set a savings goal and the app projects when you'll hit it based on your actual savings pace.
- **React frontend** - Simple dashboard with all features accessible from the browser.

- **FastAPI** - Python web framework
- **PostgreSQL** - Database
- **SQLAlchemy** - ORM (classic Column style)
- **Alembic** - Database migrations
- **bcrypt** - Password hashing
- **python-jose** - JWT tokens
- **Pydantic** - Request/response validation
- **React** - Frontend (Vite + React Router)

## How to run

### Backend setup (first time only)

```bash
cd AIExpenseGuard

# Create virtual environment
python -m venv venv

# Activate it
.\venv\Scripts\activate    # Windows PowerShell
# source venv/bin/activate # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Set up your .env file
# DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/fincoach
# SECRET_KEY=your-secret-key-change-this
# ALGORITHM=HS256
# ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Create the database (in psql)
# CREATE DATABASE fincoach;

# Run migrations
alembic upgrade head

# (Optional) Seed with demo data
python -m scripts.seed
```

### Frontend setup (first time only)

```bash
cd frontend
npm install
```

### Running the app

You need two terminals:

**Terminal 1 — Backend:**
```bash
.\venv\Scripts\activate
uvicorn app.main:app --reload
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Then open `http://localhost:5173` in your browser.

If you seeded demo data, log in with `demo@test.com` / `demo123`.

API docs are at `http://localhost:8000/docs`.

