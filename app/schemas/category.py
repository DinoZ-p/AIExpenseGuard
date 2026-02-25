from pydantic import BaseModel


class CategoryCreate(BaseModel):
    name: str
    type: str          # expense | income | transfer
    is_essential: bool = False


class CategoryResponse(CategoryCreate):
    id: int

    class Config:
        from_attributes = True
