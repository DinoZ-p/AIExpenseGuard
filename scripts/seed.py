"""
Run with: python -m scripts.seed
Creates a test user with 3 months of realistic transactions.
"""
import random
from datetime import date, timedelta
from app.database import SessionLocal
from app.models.user import User
from app.models.category import Category
from app.models.transaction import Transaction
from app.models.goal import Goal
from app.models.budget import Budget
from app.utils.auth import hash_password

db = SessionLocal()

# clean slate
for model in [Transaction, Budget, Goal, Category, User]:
    db.query(model).delete()
db.commit()

# user
user = User(email="demo@test.com", password_hash=hash_password("demo123"))
db.add(user)
db.commit()
db.refresh(user)

# categories
categories_data = [
    ("Salary",        "income",  False),
    ("Freelance",     "income",  False),
    ("Rent",          "expense", True),
    ("Groceries",     "expense", True),
    ("Dining Out",    "expense", False),
    ("Transport",     "expense", True),
    ("Subscriptions", "expense", False),
    ("Entertainment", "expense", False),
    ("Health",        "expense", True),
    ("Shopping",      "expense", False),
]

cats = {}
for name, type_, essential in categories_data:
    c = Category(user_id=user.id, name=name, type=type_, is_essential=essential)
    db.add(c)
    db.commit()
    db.refresh(c)
    cats[name] = c

# budgets (monthly)
budget_data = {
    "Rent": 1800,
    "Groceries": 500,
    "Dining Out": 300,
    "Transport": 150,
    "Subscriptions": 80,
    "Entertainment": 200,
    "Health": 100,
    "Shopping": 250,
}
for cat_name, limit in budget_data.items():
    db.add(Budget(
        user_id=user.id,
        category_id=cats[cat_name].id,
        period="monthly",
        limit_amount=limit,
    ))

# goals
db.add(Goal(
    user_id=user.id,
    title="Emergency Fund",
    target_amount=10000,
    current_amount=2500,
    target_date=date(2026, 12, 31),
    priority=1,
    type="mid",
))
db.add(Goal(
    user_id=user.id,
    title="Vacation",
    target_amount=3000,
    current_amount=800,
    target_date=date(2026, 8, 1),
    priority=3,
    type="short",
))

# transactions — 3 months of data
today = date.today()
start = today - timedelta(days=90)

# monthly income
for month_offset in range(3):
    month_start = start + timedelta(days=month_offset * 30)
    db.add(Transaction(
        user_id=user.id, category_id=cats["Salary"].id,
        amount=5200, direction="income",
        date=month_start + timedelta(days=random.randint(0, 2)),
        merchant="Employer Inc",
    ))
    if random.random() > 0.5:
        db.add(Transaction(
            user_id=user.id, category_id=cats["Freelance"].id,
            amount=random.randint(300, 800), direction="income",
            date=month_start + timedelta(days=random.randint(10, 25)),
            merchant="Freelance Client",
        ))

# monthly fixed expenses
for month_offset in range(3):
    d = start + timedelta(days=month_offset * 30 + 1)
    db.add(Transaction(
        user_id=user.id, category_id=cats["Rent"].id,
        amount=1800, direction="expense", date=d, merchant="Landlord",
    ))

# variable expenses — daily random transactions
expense_patterns = {
    "Groceries":     (3, 15, 80),    # per-week freq, min, max amount
    "Dining Out":    (4, 12, 65),
    "Transport":     (5, 5, 25),
    "Subscriptions": (0.25, 10, 15),  # roughly monthly
    "Entertainment": (2, 10, 60),
    "Health":        (0.5, 20, 80),
    "Shopping":      (1, 20, 120),
}

current = start
while current <= today:
    for cat_name, (weekly_freq, min_amt, max_amt) in expense_patterns.items():
        daily_prob = weekly_freq / 7
        if random.random() < daily_prob:
            db.add(Transaction(
                user_id=user.id,
                category_id=cats[cat_name].id,
                amount=round(random.uniform(min_amt, max_amt), 2),
                direction="expense",
                date=current,
                merchant=f"{cat_name} merchant",
            ))
    current += timedelta(days=1)

db.commit()
print(f"Seeded user: demo@test.com / demo123")
print(f"Transactions: {db.query(Transaction).count()}")
db.close()
