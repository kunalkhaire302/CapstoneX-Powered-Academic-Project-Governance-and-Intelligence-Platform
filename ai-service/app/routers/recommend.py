"""
Recommendation Router — API endpoints for project recommendations.
"""
from fastapi import APIRouter, HTTPException
from app.models.schemas import RecommendRequest, RecommendResponse
from app.services.recommendation_service import get_recommendations
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/recommend")
async def recommend_projects(request: RecommendRequest):
    """
    Generate project recommendations based on student profile.
    Uses FAISS semantic search with multi-factor ranking.
    """
    try:
        result = await get_recommendations(
            student_id=request.student_id,
            skills=request.skills,
            interests=request.interests,
            technologies=request.technologies,
        )
        return result
    except Exception as e:
        logger.error(f"Recommendation error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Recommendation failed: {str(e)}")
