from pydantic import BaseModel
from typing import Optional

class DecodeResponse(BaseModel):
    success: bool
    content: Optional[str] = None
    format: Optional[str] = None
    message: Optional[str] = None
