from fastapi import FastAPI

from app.routers import auth, categories, transactions, goals, budgets

app = FastAPI(title="FinCoach", version="0.1.0")

app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(transactions.router)
app.include_router(goals.router)
app.include_router(budgets.router)


@app.get("/health")
def health():
    return {"status": "ok"}
