import os
from fastapi import Header, HTTPException, status

AI_INTERNAL_SECRET = os.getenv("AI_INTERNAL_SECRET", "dev_internal_secret_key_123")

async def verify_internal_token(x_internal_token: str = Header(None)):
    if not x_internal_token or x_internal_token != AI_INTERNAL_SECRET:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Direct access to AI Service is forbidden. Requests must be proxied through the Backend.",
        )
