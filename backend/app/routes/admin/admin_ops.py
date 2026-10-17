"""
FastAPI router for administrative operations:
- Inspecting registered users and modifying user roles (resident, staff, admin)
- Reviewing system-wide audit logs
- Viewing system status and operational metrics
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from app.auth import get_current_user, require_role, AuthUser
from app.supabase_client import get_supabase_admin

router = APIRouter(prefix="/api/admin", tags=["Administration"])


class RoleUpdateRequest(BaseModel):
    role: str = Field(..., description="Target role: resident, staff, admin")


class UserProfileResponse(BaseModel):
    id: str
    clerk_user_id: str
    display_name: str
    email: str
    role: str
    created_at: datetime
    updated_at: datetime


class AuditLogResponse(BaseModel):
    id: str
    actor_id: str
    action: str
    target_type: Optional[str]
    target_id: Optional[str]
    metadata: Optional[dict]
    created_at: datetime


class SystemMetricsResponse(BaseModel):
    total_reports: int
    submitted: int
    under_review: int
    assigned: int
    in_progress: int
    resolved: int
    rejected: int
    total_users: int
    total_staff: int


@router.get("/metrics", response_model=SystemMetricsResponse)
async def get_system_metrics(
    current_user: AuthUser = Depends(require_role("admin", "staff")),
):
    """
    Returns aggregate counts for status dashboards.
    """
    supabase = get_supabase_admin()
    try:
        # Fetch reports status counts
        reports_res = supabase.table("reports").select("status").execute()
        reports = reports_res.data or []

        counts = {
            "submitted": 0,
            "under_review": 0,
            "assigned": 0,
            "in_progress": 0,
            "resolved": 0,
            "rejected": 0,
        }
        for r in reports:
            st = r.get("status")
            if st in counts:
                counts[st] += 1

        # Fetch users count
        users_res = supabase.table("profiles").select("role").execute()
        users = users_res.data or []
        staff_count = sum(1 for u in users if u.get("role") in ["staff", "admin"])

        return SystemMetricsResponse(
            total_reports=len(reports),
            submitted=counts["submitted"],
            under_review=counts["under_review"],
            assigned=counts["assigned"],
            in_progress=counts["in_progress"],
            resolved=counts["resolved"],
            rejected=counts["rejected"],
            total_users=len(users),
            total_staff=staff_count,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate metrics: {str(e)}",
        )


@router.get("/users", response_model=List[UserProfileResponse])
async def list_users(
    current_user: AuthUser = Depends(require_role("admin")),
):
    """
    Admin-only: lists all registered profiles.
    """
    supabase = get_supabase_admin()
    try:
        res = supabase.table("profiles").select("*").order("created_at", desc=True).limit(100).execute()
        return res.data or []
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch users: {str(e)}",
        )


@router.patch("/users/{clerk_user_id}/role")
async def update_user_role(
    clerk_user_id: str,
    payload: RoleUpdateRequest,
    current_user: AuthUser = Depends(require_role("admin")),
):
    """
    Admin-only: updates user role in profiles and logs an audit record.
    """
    if payload.role not in ["resident", "staff", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Role must be one of: resident, staff, admin.",
        )

    supabase = get_supabase_admin()
    try:
        # Check target user
        target_res = supabase.table("profiles").select("role, display_name").eq("clerk_user_id", clerk_user_id).execute()
        if not target_res.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
        old_role = target_res.data[0]["role"]

        # Update role
        supabase.table("profiles").update({"role": payload.role}).eq("clerk_user_id", clerk_user_id).execute()

        # Log audit entry
        supabase.table("audit_logs").insert(
            {
                "actor_id": current_user.user_id,
                "action": "role_changed",
                "target_type": "profile",
                "target_id": clerk_user_id,
                "metadata": {
                    "old_role": old_role,
                    "new_role": payload.role,
                    "target_name": target_res.data[0]["display_name"],
                },
            }
        ).execute()

        return {"status": "success", "message": f"Role updated to '{payload.role}'."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to change user role: {str(e)}",
        )


@router.get("/audit-logs", response_model=List[AuditLogResponse])
async def get_audit_logs(
    current_user: AuthUser = Depends(require_role("admin")),
):
    """
    Admin-only: retrieves recent system audit logs.
    """
    supabase = get_supabase_admin()
    try:
        res = supabase.table("audit_logs").select("*").order("created_at", desc=True).limit(50).execute()
        return res.data or []
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch audit logs: {str(e)}",
        )
