"""
Validation engine for report status transitions.
Enforces business rules on permitted status progressions.
"""

from typing import Tuple, List, Optional
from fastapi import HTTPException, status

# Permitted state progression graph
PERMITTED_TRANSITIONS = {
    "submitted": ["under_review", "rejected"],
    "under_review": ["assigned", "rejected"],
    "assigned": ["in_progress", "resolved", "rejected"],
    "in_progress": ["resolved", "rejected"],
    "resolved": [],  # Terminal state for regular operations
    "rejected": ["under_review"],  # Only admins can reopen a rejected report
}


def validate_status_transition(
    current_status: str,
    new_status: str,
    user_role: str,
    notes: Optional[str] = None,
) -> Tuple[bool, str]:
    """
    Validates if a status transition is permitted.
    Returns (is_valid, error_message).
    """
    if current_status == new_status:
        return False, f"Report is already in '{current_status}' status."

    # Rule: Only admin can reopen a rejected report
    if current_status == "rejected":
        if user_role != "admin":
            return False, "Only system administrators can reopen a rejected report."
        if new_status != "under_review":
            return False, "Rejected reports can only transition back to 'under_review'."
        return True, "Valid transition by administrator."

    # Rule: Rejection requires a mandatory explanation note
    if new_status == "rejected":
        if not notes or len(notes.strip()) < 10:
            return False, "A rejection requires an explanatory note of at least 10 characters."

    # Check state graph
    allowed_next_states = PERMITTED_TRANSITIONS.get(current_status, [])
    if new_status not in allowed_next_states:
        allowed_str = ", ".join(allowed_next_states) if allowed_next_states else "none (terminal state)"
        return (
            False,
            f"Invalid status transition from '{current_status}' to '{new_status}'. Allowed next statuses: {allowed_str}.",
        )

    return True, "Valid transition."
