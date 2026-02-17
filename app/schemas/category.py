from pydantic import BaseModel


class CategoryCreate(BaseModel):
    name: str
    type: str  # "income" or "expense"


class CategoryOut(BaseModel):
    id: int
    name: str
    type: str

    model_config = {"from_attributes": True}
