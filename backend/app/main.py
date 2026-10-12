"""
Main entry point for MtaaClean Mombasa FastAPI backend.
"""

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.auth import get_current_user, require_role, AuthUser
from app.webhooks import router as webhooks_router

app = FastAPI(
    title="MtaaClean Mombasa API",
    description="Trusted backend service for waste collection and illegal dumping reporting system in Tudor, Mombasa.",
    version="0.1.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount webhooks
app.include_router(webhooks_router)


@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "service": "mtaaclean-backend",
        "county": "Mombasa",
        "subcounty": "Tudor",
    }


@app.get("/api/auth/me", tags=["Auth"])
async def get_me(user: AuthUser = Depends(get_current_user)):
    """
    Returns verified caller identity and role.
    """
    return {
        "user_id": user.user_id,
        "role": user.role,
        "email": user.email,
    }


@app.get("/api/staff/test", tags=["Staff"])
async def staff_only_test(user: AuthUser = Depends(require_role("staff", "admin"))):
    """
    Verified staff or admin only endpoint.
    """
    return {
        "message": "Authorized staff access granted",
        "user_id": user.user_id,
        "role": user.role,
    }
