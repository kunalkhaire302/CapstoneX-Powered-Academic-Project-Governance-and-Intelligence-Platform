"""
Team Formation Router — API endpoints for AI-assisted team creation.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from app.services.team_service import form_teams
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


class TeamFormationRequest(BaseModel):
    students: List[Dict] = Field(..., description="List of student profiles")
    team_size: int = Field(default=4, ge=2, le=10, description="Target team size")
    constraints: Optional[Dict] = Field(default=None, description="Optimization constraints")


@router.post("/teams/form")
async def generate_teams(request: TeamFormationRequest):
    """
    Form optimal teams using hybrid optimization (KMeans + Hungarian algorithm).
    """
    try:
        result = await form_teams(
            students=request.students,
            team_size=request.team_size,
            constraints=request.constraints,
        )
        return result
    except Exception as e:
        logger.error(f"Team formation error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Team formation failed: {str(e)}")
