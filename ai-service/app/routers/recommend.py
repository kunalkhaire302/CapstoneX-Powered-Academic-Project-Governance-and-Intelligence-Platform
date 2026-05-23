from fastapi import APIRouter, HTTPException
from app.models.schemas import RecommendRequest, RecommendResponse
from app.services.recommendation_service import get_recommendations
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/recommend", response_model=RecommendResponse)
async def recommend_projects(request: RecommendRequest):
    """Generate project domain recommendations based on student profile."""
    try:
        result = get_recommendations(
            student_id=request.student_id,
            skills=request.skills,
            interests=request.interests,
            technologies=request.technologies,
        )
        return result
    except Exception as e:
        logger.error(f"Recommendation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Recommendation failed: {str(e)}")
