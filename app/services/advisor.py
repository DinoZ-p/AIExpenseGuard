from datetime import date, timedelta
from sqlalchemy.orm import Session
from openai import OpenAI

from app.config import settings
from app.models.goal import Goal
from app.models.budget import Budget
from app.models.category import Category
from app.models.transaction import Transaction
from app.services.analytics import get_spending_by_category, get_overspend_categories


def build_context(db: Session, user_id: int, monthly_savings: float) -> str:
    today = date.today()
    start = today - timedelta(days=30)

    goals = db.query(Goal).filter(Goal.user_id == user_id).all()
    budgets = db.query(Budget).filter(Budget.user_id == user_id).all()
    categories = {c.id: c.name for c in db.query(Category).filter(Category.user_id == user_id).all()}
    spending = get_spending_by_category(db, user_id, start, today)
    overspends = get_overspend_categories(db, user_id, start, today)

    lines = [
        f"Today's date: {today.isoformat()}",
        f"Monthly savings target: ${monthly_savings:.2f}",
        "",
        "=== GOALS ===",
    ]
    for g in goals:
        pct = (g.current_amount / g.target_amount * 100) if g.target_amount > 0 else 0
        lines.append(
            f"- {g.title}: ${g.current_amount:.2f} / ${g.target_amount:.2f} "
            f"({pct:.0f}%) | target date: {g.target_date} | priority: {g.priority} | type: {g.type}"
        )

    lines += ["", "=== BUDGETS ==="]
    for b in budgets:
        lines.append(f"- {categories.get(b.category_id, b.category_id)}: ${b.limit_amount:.2f}/{b.period}")

    lines += ["", "=== SPENDING LAST 30 DAYS ==="]
    for s in spending:
        if s["total"] > 0:
            lines.append(f"- {s['category_name']}: ${s['total']:.2f} ({'essential' if s['is_essential'] else 'non-essential'})")

    if overspends:
        lines += ["", "=== OVER BUDGET ==="]
        for o in overspends:
            lines.append(
                f"- {o['category_name']}: spent ${o['spent']:.2f} vs limit ${o['budget_limit']:.2f} "
                f"(over by ${o['over_by']:.2f}, {o['over_by_pct']}%)"
            )

    return "\n".join(lines)


def ask_advisor(db: Session, user_id: int, monthly_savings: float, question: str, history: list[dict]) -> str:
    context = build_context(db, user_id, monthly_savings)

    system_prompt = (
        "You are a personal finance advisor. Use the user's financial data below to give specific, "
        "actionable advice. Be concise and direct. If you reference numbers, use the data provided. "
        "Do not make up numbers not in the data.\n\n"
        f"USER FINANCIAL DATA:\n{context}"
    )

    messages = [{"role": "system", "content": system_prompt}]
    messages += history
    messages.append({"role": "user", "content": question})

    client = OpenAI(api_key=settings.openai_api_key)
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        max_tokens=500,
        temperature=0.7,
    )
    return response.choices[0].message.content
