from fastapi import APIRouter, HTTPException
from app.models.schemas import FeedbackRequest, FeedbackResponse
from app.services.feedback_service import generate_feedback
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/generate-feedback", response_model=FeedbackResponse)
async def generate_eval_feedback(request: FeedbackRequest):
    """Generate AI evaluation feedback based on rubric scores."""
    try:
        result = generate_feedback(request.rubric_scores, request.summary)
        return result
    except Exception as e:
        logger.error(f"Feedback generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Feedback generation failed: {str(e)}")
