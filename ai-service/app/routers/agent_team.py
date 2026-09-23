from fastapi import APIRouter

from app.models.agent_team_schemas import AgentTeamRequest, AgentTeamResponse
from app.services.agent_team_service import execute_agent_team

router = APIRouter()


@router.post("/agent-team/execute", response_model=AgentTeamResponse)
async def run_agent_team(request: AgentTeamRequest) -> AgentTeamResponse:
    """Execute the guarded hierarchical agent workflow for one project."""
    return await execute_agent_team(request)
