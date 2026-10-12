"""
Webhook handler for Clerk user lifecycle events.
Listens for user.created and user.updated events to synchronize profiles in Supabase.
"""

from fastapi import APIRouter, Request, HTTPException, status
from svix.webhooks import Webhook, WebhookVerificationError
from app.config import settings
from app.supabase_client import get_supabase_admin

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])


@router.post("/clerk")
async def clerk_webhook(request: Request):
    """
    Handle verified Clerk webhooks.
    """
    if not settings.CLERK_WEBHOOK_SECRET:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="CLERK_WEBHOOK_SECRET is not configured.",
        )

    # 1. Extract svix headers for signature verification
    svix_id = request.headers.get("svix-id")
    svix_timestamp = request.headers.get("svix-timestamp")
    svix_signature = request.headers.get("svix-signature")

    if not svix_id or not svix_timestamp or not svix_signature:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing Svix webhook verification headers.",
        )

    body = await request.body()

    # 2. Verify signature
    wh = Webhook(settings.CLERK_WEBHOOK_SECRET)
    try:
        payload = wh.verify(
            body,
            {
                "svix-id": svix_id,
                "svix-timestamp": svix_timestamp,
                "svix-signature": svix_signature,
            },
        )
    except WebhookVerificationError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid webhook signature.",
        )

    event_type = payload.get("type")
    data = payload.get("data", {})

    supabase = get_supabase_admin()

    # 3. Handle user.created event
    if event_type == "user.created":
        user_id = data.get("id")
        first_name = data.get("first_name") or ""
        last_name = data.get("last_name") or ""
        display_name = f"{first_name} {last_name}".strip() or "Resident"

        # Get primary email address
        email_addresses = data.get("email_addresses", [])
        primary_email_id = data.get("primary_email_address_id")
        email = ""
        for item in email_addresses:
            if item.get("id") == primary_email_id:
                email = item.get("email_address", "")
                break
        if not email and email_addresses:
            email = email_addresses[0].get("email_address", "")

        phone_numbers = data.get("phone_numbers", [])
        phone = phone_numbers[0].get("phone_number") if phone_numbers else None

        # Check initial role from public_metadata if any, default to resident
        public_metadata = data.get("public_metadata", {}) or {}
        role = public_metadata.get("role", "resident")

        # Upsert profile in Supabase (idempotent)
        supabase.table("profiles").upsert(
            {
                "clerk_user_id": user_id,
                "display_name": display_name,
                "email": email,
                "phone": phone,
                "role": role,
            },
            on_conflict="clerk_user_id",
        ).execute()

        return {"status": "success", "message": "Profile created/updated"}

    # 4. Handle user.updated event
    elif event_type == "user.updated":
        user_id = data.get("id")
        first_name = data.get("first_name") or ""
        last_name = data.get("last_name") or ""
        display_name = f"{first_name} {last_name}".strip()

        update_payload = {}
        if display_name:
            update_payload["display_name"] = display_name

        if update_payload:
            supabase.table("profiles").update(update_payload).eq(
                "clerk_user_id", user_id
            ).execute()

        return {"status": "success", "message": "Profile updated"}

    return {"status": "ignored", "event": event_type}
