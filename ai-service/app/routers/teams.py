from fastapi import APIRouter, HTTPException
from app.models.schemas import TeamFormationRequest, TeamFormationResponse
from app.services.team_service import form_teams
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/form-teams", response_model=TeamFormationResponse)
async def create_teams(request: TeamFormationRequest):
    """Form balanced teams using K-Means clustering on student skills."""
    try:
        result = form_teams(request.students, request.team_size)
        return result
    except Exception as e:
        logger.error(f"Team formation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Team formation failed: {str(e)}")
