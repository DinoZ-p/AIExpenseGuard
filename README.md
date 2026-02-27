
A financial guarding API that tracks expenses, budgets, goals, and gives you analytics on your spending habits. Built with FastAPI + PostgreSQL.

## What it does

- **User auth** - Register and login with JWT tokens. All data is scoped per user so nobody sees your stuff.
- **CRUD for everything** - Categories, transactions, goals, budgets. Create, list, delete.
- **CSV import** - Upload a bank statement CSV (Chase, Amex, Mint format) and it auto-imports all transactions.
- **Analytics engine** - Savings rate, spending by category, overspend alerts, goal projections.
- **Goal tracking** - Set a savings goal and the app projects when you'll hit it based on your actual savings pace.



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


