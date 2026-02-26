
A financial coaching API that tracks expenses, budgets, goals, and gives you analytics on your spending habits. Built with FastAPI + PostgreSQL.

## What it does

- **User auth** - Register and login with JWT tokens. All data is scoped per user so nobody sees your stuff.
- **CRUD for everything** - Categories, transactions, goals, budgets. Create, list, delete.
- **CSV import** - Upload a bank statement CSV (Chase, Amex, Mint format) and it auto-imports all transactions.
- **Analytics engine** - Savings rate, spending by category, overspend alerts, goal projections.
- **Goal tracking** - Set a savings goal and the app projects when you'll hit it based on your actual savings pace.

## Tech stack

- **FastAPI** - Python web framework
- **PostgreSQL** - Database
- **SQLAlchemy** - ORM (classic Column style)
- **Alembic** - Database migrations
- **bcrypt** - Password hashing
- **python-jose** - JWT tokens
- **Pydantic** - Request/response validation

## How to run

```bash
# 1. Clone and enter the project
cd AIExpenseGuard

# 2. Create virtual environment
python -m venv venv
source venv/Scripts/activate  # Windows
# source venv/bin/activate    # Mac/Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up your .env file
# DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/fincoach
# SECRET_KEY=your-secret-key-change-this
# ALGORITHM=HS256
# ACCESS_TOKEN_EXPIRE_MINUTES=1440

# 5. Create the database
# In psql: CREATE DATABASE fincoach;

# 6. Run migrations
alembic upgrade head

# 7. (Optional) Seed with demo data
python -m scripts.seed

# 8. Start the server
uvicorn app.main:app --reload
```

Then go to `http://localhost:8000/docs` to see all the endpoints.

## API endpoints
**Auth:**
- `POST /auth/register` - Create account
- `POST /auth/login` - Get JWT token

**CRUD (all require auth):**
- `POST/GET/DELETE /categories/`
- `POST/GET/DELETE /transactions/` (GET supports filtering by date, category, direction)
- `POST/GET/DELETE /goals/`
- `POST/GET/DELETE /budgets/`
- `POST /transactions/import-csv` - Upload bank CSV

**Analytics (all require auth):**
- `GET /analytics/savings-rate` - Income vs expenses
- `GET /analytics/spending` - Breakdown by category
- `GET /analytics/overspend` - Categories over budget
- `GET /analytics/goal-projection/{goal_id}` - When will you hit your goal
- `GET /analytics/report` - Everything combined

## How it's built

The project follows a layered architecture:

- **Routes are thin** - Just validate input, call a service, return the result
- **Services are fat** - All the real logic (analytics calculations, budget comparisons) lives in `app/services/`
- **Every query filters by user** - Security fundamental. Users can never see each other's data.
- **JWT auth** - Token-based. Register, get a token, send it in the Authorization header.

## Running tests

```bash
pytest -v
```

Tests use SQLite in-memory so you don't need PostgreSQL running for tests.

## Project structure

```
app/
  config.py          # .env loading via pydantic-settings
  database.py        # SQLAlchemy engine + session
  main.py            # FastAPI app + router wiring
  models/            # SQLAlchemy ORM models (5 tables)
  schemas/           # Pydantic request/response models
  routers/           # API endpoints (thin)
  services/          # Business logic (fat)
  utils/auth.py      # JWT + password hashing
alembic/             # Database migrations
scripts/seed.py      # Demo data generator
tests/               # pytest tests
```
