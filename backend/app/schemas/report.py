"""
Pydantic schemas for report submission and responses.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ReportCreateRequest(BaseModel):
    description: str = Field(..., min_length=20, max_length=2000, description="Description of the waste incident (minimum 20 characters)")
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    address_hint: Optional[str] = Field(None, max_length=255)
    area_name: Optional[str] = Field("Tudor", max_length=100)
    photo_storage_path: str = Field(..., min_length=5, description="Storage path of the uploaded evidence photo")
    photo_mime_type: str = Field(..., description="MIME type of the photo, e.g. image/jpeg, image/png")


class ReportResponse(BaseModel):
    id: str
    reporter_id: str
    description: str
    status: str
    area_name: Optional[str]
    latitude: float
    longitude: float
    address_hint: Optional[str]
    submitted_at: datetime
    updated_at: datetime


class ReportDetailResponse(ReportResponse):
    photos: List[dict] = []
    status_history: List[dict] = []
