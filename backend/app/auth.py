"""
Clerk JWT authentication dependency for FastAPI.
Fetches Clerk's JWKS and verifies incoming Bearer tokens on protected endpoints.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from jwt import PyJWKClient
from pydantic import BaseModel
from typing import Optional
from app.config import settings

security = HTTPBearer()

# We cache the JWK client to avoid making an HTTP request on every single call
_jwks_client: Optional[PyJWKClient] = None


def get_jwks_client() -> PyJWKClient:
    global _jwks_client
    if _jwks_client is None:
        # Clerk's JWKS endpoint can be derived or fetched from their API
        # By default, Clerk publishes keys at https://<frontend-api>/.well-known/jwks.json
        # Or using the Clerk API URL directly with secret key
        # For universal verification, Clerk tokens specify the 'iss' header
        pass
    return _jwks_client


class AuthUser(BaseModel):
    user_id: str
    role: str = "resident"
    email: Optional[str] = None
    claims: dict = {}


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> AuthUser:
    token = credentials.credentials

    try:
        # Decode token unverified first to get issuer / kid
        unverified_header = jwt.get_unverified_header(token)
        unverified_claims = jwt.decode(token, options={"verify_signature": False})
        issuer = unverified_claims.get("iss")

        if not issuer:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing issuer claim.",
            )

        jwks_url = f"{issuer.rstrip('/')}/.well-known/jwks.json"
        jwks_client = PyJWKClient(jwks_url)
        signing_key = jwks_client.get_signing_key_from_jwt(token)

        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            issuer=issuer,
            options={"verify_aud": False},  # Clerk standard audience verification
        )

        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token payload missing subject identifier.",
            )

        # Extract role from custom claims or app_metadata if present
        app_metadata = payload.get("app_metadata", {}) or {}
        role = app_metadata.get("role", "resident")

        return AuthUser(
            user_id=user_id,
            role=role,
            email=payload.get("email"),
            claims=payload,
        )

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired. Please refresh your session.",
        )
    except jwt.PyJWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token verification failed: {str(e)}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication error: {str(e)}",
        )


def require_role(*allowed_roles: str):
    """
    Dependency factory to enforce server-side role check.
    Usage: Depends(require_role('staff', 'admin'))
    """
    async def role_checker(user: AuthUser = Depends(get_current_user)) -> AuthUser:
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Requires one of roles: {', '.join(allowed_roles)}.",
            )
        return user

    return role_checker
