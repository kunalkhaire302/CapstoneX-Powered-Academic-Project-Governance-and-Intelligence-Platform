from fastapi import APIRouter, HTTPException
from app.models.schemas import RiskRequest, RiskResponse
from app.services.risk_service import predict_risk
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/risk-score", response_model=RiskResponse)
async def get_risk_score(request: RiskRequest):
    """Predict project risk level for a group."""
    try:
        result = predict_risk(request.group_id, request.features)
        return result
    except Exception as e:
        logger.error(f"Risk prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Risk prediction failed: {str(e)}")
