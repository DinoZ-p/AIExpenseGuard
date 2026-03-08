from fastapi import FastAPI
from app.routers import auth, categories, transactions, goals, budgets, analytics, advisor

app = FastAPI(title="SpendingTrack", version="0.1.0")

app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(transactions.router)
app.include_router(goals.router)
app.include_router(budgets.router)
app.include_router(analytics.router)
app.include_router(advisor.router)
