"""
Authentication and Security Dependencies for CapstoneX AI Service.
Validates internal tokens for backend-to-AI-service communication.
"""
import os
import logging
from fastapi import Header, HTTPException, status

logger = logging.getLogger(__name__)

# Load from environment — validated at startup via config
AI_INTERNAL_SECRET = os.getenv("AI_INTERNAL_SECRET")

if not AI_INTERNAL_SECRET:
    logger.critical(
        "❌ AI_INTERNAL_SECRET is not set! "
        "The AI service will reject all authenticated requests. "
        "Set this in your .env file."
    )


async def verify_internal_token(x_internal_token: str = Header(None)):
    """
    Verify that requests come from the backend service via internal token.
    All AI service endpoints (except /health) require this.
    """
    if not AI_INTERNAL_SECRET:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="AI service misconfigured: AI_INTERNAL_SECRET not set.",
        )

    if not x_internal_token or x_internal_token != AI_INTERNAL_SECRET:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Direct access to AI Service is forbidden. Requests must be proxied through the Backend.",
        )
