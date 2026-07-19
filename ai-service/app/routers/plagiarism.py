"""
Plagiarism Detection Router — API endpoints for document originality checking.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from app.services.plagiarism_service import check_plagiarism, quick_check
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


class PlagiarismCheckRequest(BaseModel):
    text: str = Field(..., min_length=50, description="Document text to check")
    document_type: str = Field(default="problem_statement", description="Type of document")
    threshold: float = Field(default=0.75, ge=0.1, le=1.0, description="Similarity threshold")
    exclude_project_id: Optional[str] = Field(default=None, description="Exclude self-match")


class QuickCheckRequest(BaseModel):
    text: str = Field(..., min_length=30, description="Text to quick-check")


@router.post("/plagiarism/check")
async def plagiarism_full_check(request: PlagiarismCheckRequest):
    """
    Full plagiarism analysis with detailed matching and highlighting.
    """
    try:
        result = await check_plagiarism(
            text=request.text,
            document_type=request.document_type,
            threshold=request.threshold,
            exclude_project_id=request.exclude_project_id,
        )
        return result
    except Exception as e:
        logger.error(f"Plagiarism check error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Plagiarism check failed: {str(e)}")


@router.post("/plagiarism/quick-check")
async def plagiarism_quick_check(request: QuickCheckRequest):
    """
    Fast sentence-level plagiarism check.
    Returns similarity percentage and risk level.
    """
    try:
        result = await quick_check(request.text)
        return result
    except Exception as e:
        logger.error(f"Quick plagiarism check error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Quick check failed: {str(e)}")
