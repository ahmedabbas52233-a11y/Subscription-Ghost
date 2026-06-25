from pydantic import BaseModel
from typing import List


class DocumentUploadResponse(BaseModel):
    document_id: int
    filename: str
    extracted_text: str
    message: str


class AnalysisResponse(BaseModel):
    analysis: str
    sentiment: str
    key_points: List[str]
    recommendations: List[str]


class DocumentHistoryItem(BaseModel):
    id: int
    filename: str
    file_type: str
    file_size: int
    created_at: str  # ISO string — serialised in the router

    model_config = {"from_attributes": True}
