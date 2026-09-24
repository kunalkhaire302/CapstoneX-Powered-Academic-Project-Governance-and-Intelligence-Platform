"""Lightweight production entry point for the governed AI Team runtime.

This process intentionally excludes training, embeddings, FAISS, SHAP, and
scheduled model jobs. Those workloads need separately sized infrastructure.
"""
import logging
import os

from fastapi import Depends, FastAPI

from app.dependencies import verify_internal_token
from app.models.agent_team_schemas import AgentTeamRequest, AgentTeamResponse
from app.services.agent_team_service import execute_agent_team

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)

app = FastAPI(title="CapstoneX Agent Runtime", version="1.0.0")


@app.get("/api/ai/health")
async def health() -> dict:
    return {
        "status": "healthy",
        "service": "capstonex-agent-runtime",
        "mode": os.getenv("LLM_PROVIDER", "fallback"),
    }


@app.post(
    "/api/ai/agent-team/execute",
    response_model=AgentTeamResponse,
    dependencies=[Depends(verify_internal_token)],
)
async def execute(request: AgentTeamRequest) -> AgentTeamResponse:
    return await execute_agent_team(request)
