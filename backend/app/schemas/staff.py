"""
Pydantic schemas for staff operations (assignments, status updates, queue filters).
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class StatusUpdateRequest(BaseModel):
    new_status: str = Field(
        ...,
        description="Next operational status (under_review, assigned, in_progress, resolved, rejected)",
    )
    notes: Optional[str] = Field(None, max_length=1000, description="Notes on the status change")
    after_photo_storage_path: Optional[str] = Field(None, description="Optional after-cleanup photo path")
    after_photo_mime_type: Optional[str] = Field(None, description="MIME type of after-cleanup photo")


class AssignmentRequest(BaseModel):
    assigned_to: str = Field(..., min_length=1, description="Clerk user ID of the staff member or team")
    notes: Optional[str] = Field(None, max_length=1000, description="Assignment instructions or notes")


class StaffMemberResponse(BaseModel):
    id: str
    clerk_user_id: str
    display_name: str
    email: str
    role: str


class StaffReportQueueItem(BaseModel):
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
    reporter_name: Optional[str] = None
    reporter_email: Optional[str] = None
    photos_count: int = 0
    assigned_to_name: Optional[str] = None
