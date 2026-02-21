from pydantic import BaseModel


class CategoryCreate(BaseModel):
    name: str
    type: str  # expense | income | transfer
    is_essential: bool = False


class CategoryOut(BaseModel):
    id: int
    user_id: int
    name: str
    type: str
    is_essential: bool

    model_config = {"from_attributes": True}
