"""
FastAPI router for staff operations:
- Fetching incident review queue with filters
- Assigning reports to cleanup staff
- Progressing report operational statuses with validation
- Uploading after-cleanup evidence and notes
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from app.auth import get_current_user, require_role, AuthUser
from app.schemas.staff import (
    StatusUpdateRequest,
    AssignmentRequest,
    StaffMemberResponse,
    StaffReportQueueItem,
)
from app.services.transition_validator import validate_status_transition
from app.supabase_client import get_supabase_admin

router = APIRouter(prefix="/api/staff", tags=["Staff Operations"])


@router.get("/members", response_model=List[StaffMemberResponse])
async def get_staff_members(
    current_user: AuthUser = Depends(require_role("staff", "admin")),
):
    """
    Returns available staff members for report assignment.
    """
    supabase = get_supabase_admin()
    try:
        res = (
            supabase.table("profiles")
            .select("id, clerk_user_id, display_name, email, role")
            .in_("role", ["staff", "admin"])
            .order("display_name", desc=False)
            .execute()
        )
        return res.data or []
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch staff members: {str(e)}",
        )


@router.get("/reports", response_model=List[StaffReportQueueItem])
async def get_staff_report_queue(
    status_filter: Optional[str] = Query(None, description="Filter by status"),
    search: Optional[str] = Query(None, description="Search description or area"),
    current_user: AuthUser = Depends(require_role("staff", "admin")),
):
    """
    Returns reports queue for review and assignment by authorized staff.
    """
    supabase = get_supabase_admin()
    try:
        query = supabase.table("reports").select(
            "*, reporter:profiles!reports_reporter_id_fkey(display_name, email), photos:report_photos(id), current_assignment:assignments!assignments_report_id_fkey(assigned_to, assignee:profiles!assignments_assigned_to_fkey(display_name))"
        )

        if status_filter and status_filter != "all":
            query = query.eq("status", status_filter)

        if search:
            query = query.ilike("description", f"%{search}%")

        res = query.order("submitted_at", desc=True).limit(100).execute()

        items = []
        for r in res.data or []:
            reporter = r.get("reporter") or {}
            photos = r.get("photos") or []
            assignment_list = r.get("current_assignment") or []
            assigned_name = None
            if assignment_list:
                latest_assign = assignment_list[-1]
                assignee = latest_assign.get("assignee") or {}
                assigned_name = assignee.get("display_name")

            items.append(
                StaffReportQueueItem(
                    id=r["id"],
                    reporter_id=r["reporter_id"],
                    description=r["description"],
                    status=r["status"],
                    area_name=r.get("area_name"),
                    latitude=r["latitude"],
                    longitude=r["longitude"],
                    address_hint=r.get("address_hint"),
                    submitted_at=r["submitted_at"],
                    updated_at=r["updated_at"],
                    reporter_name=reporter.get("display_name"),
                    reporter_email=reporter.get("email"),
                    photos_count=len(photos),
                    assigned_to_name=assigned_name,
                )
            )
        return items
    except Exception as e:
        # Fallback if complex joins are not yet aliased
        try:
            simple_query = supabase.table("reports").select("*")
            if status_filter and status_filter != "all":
                simple_query = simple_query.eq("status", status_filter)
            if search:
                simple_query = simple_query.ilike("description", f"%{search}%")
            simple_res = simple_query.order("submitted_at", desc=True).limit(100).execute()

            fallback_items = []
            for r in simple_res.data or []:
                fallback_items.append(
                    StaffReportQueueItem(
                        id=r["id"],
                        reporter_id=r["reporter_id"],
                        description=r["description"],
                        status=r["status"],
                        area_name=r.get("area_name"),
                        latitude=r["latitude"],
                        longitude=r["longitude"],
                        address_hint=r.get("address_hint"),
                        submitted_at=r["submitted_at"],
                        updated_at=r["updated_at"],
                    )
                )
            return fallback_items
        except Exception as err:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch staff queue: {str(err)}",
            )


@router.post("/reports/{report_id}/assign")
async def assign_report(
    report_id: str,
    payload: AssignmentRequest,
    current_user: AuthUser = Depends(require_role("staff", "admin")),
):
    """
    Assigns a report to a cleanup staff member.
    Automatically moves report status to 'assigned' if it was 'under_review' or 'submitted'.
    Records assignment entry and status history.
    """
    supabase = get_supabase_admin()

    # 1. Check report exists
    rep_res = supabase.table("reports").select("id, status").eq("id", report_id).execute()
    if not rep_res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")
    current_report = rep_res.data[0]
    current_status = current_report["status"]

    try:
        # 2. Insert assignment
        assignment_data = {
            "report_id": report_id,
            "assigned_to": payload.assigned_to,
            "assigned_by": current_user.user_id,
            "notes": payload.notes,
        }
        supabase.table("assignments").insert(assignment_data).execute()

        # 3. Transition status to 'assigned' if currently submitted or under_review
        if current_status in ["submitted", "under_review"]:
            supabase.table("reports").update({"status": "assigned"}).eq("id", report_id).execute()

            # Record in status history
            supabase.table("status_history").insert(
                {
                    "report_id": report_id,
                    "previous_status": current_status,
                    "new_status": "assigned",
                    "actor_id": current_user.user_id,
                    "notes": f"Assigned to team/staff member. {payload.notes or ''}".strip(),
                }
            ).execute()

        return {"status": "success", "message": "Report assigned successfully"}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Assignment failed: {str(e)}",
        )


@router.patch("/reports/{report_id}/status")
async def update_report_status(
    report_id: str,
    payload: StatusUpdateRequest,
    current_user: AuthUser = Depends(require_role("staff", "admin")),
):
    """
    Updates a report's operational status with server-side validation.
    Optionally records after-cleanup photograph evidence on resolution.
    Records audit entry in status_history.
    """
    supabase = get_supabase_admin()

    # 1. Fetch current status
    rep_res = supabase.table("reports").select("id, status").eq("id", report_id).execute()
    if not rep_res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")
    current_status = rep_res.data[0]["status"]

    # 2. Validate transition
    is_valid, validation_msg = validate_status_transition(
        current_status=current_status,
        new_status=payload.new_status,
        user_role=current_user.role,
        notes=payload.notes,
    )
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=validation_msg,
        )

    try:
        # 3. Update report status
        supabase.table("reports").update({"status": payload.new_status}).eq("id", report_id).execute()

        # 4. If after-cleanup photo is provided, record it in report_photos
        if payload.after_photo_storage_path:
            photo_data = {
                "report_id": report_id,
                "storage_path": payload.after_photo_storage_path,
                "mime_type": payload.after_photo_mime_type or "image/jpeg",
                "photo_type": "after",
            }
            supabase.table("report_photos").insert(photo_data).execute()

        # 5. Append immutable status_history entry
        history_data = {
            "report_id": report_id,
            "previous_status": current_status,
            "new_status": payload.new_status,
            "actor_id": current_user.user_id,
            "notes": payload.notes,
        }
        supabase.table("status_history").insert(history_data).execute()

        return {
            "status": "success",
            "message": f"Status updated to '{payload.new_status}'.",
            "report_id": report_id,
            "new_status": payload.new_status,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Status update transaction failed: {str(e)}",
        )
