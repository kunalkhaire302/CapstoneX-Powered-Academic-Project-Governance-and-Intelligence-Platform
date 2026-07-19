"""
Feedback & Problem Analysis Routers
API endpoints for NLP/LLM text analysis.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from app.services.feedback_service import analyze_feedback
from app.services.problem_service import analyze_problem_statement
import logging

feedback_router = APIRouter()
problem_router = APIRouter()
logger = logging.getLogger(__name__)


class FeedbackRequest(BaseModel):
    text: str = Field(..., description="Mentor feedback text to analyze")


class ProblemStatementRequest(BaseModel):
    title: str = Field(..., description="Project title")
    description: str = Field(..., description="Project description/problem statement")
    tech_stack: List[str] = Field(default_factory=list, description="Proposed technologies")
    domain: str = Field(default="", description="Project domain")


@feedback_router.post("/feedback/analyze")
async def process_feedback(request: FeedbackRequest):
    """Analyze mentor feedback for sentiment, action items, and key points."""
    try:
        return await analyze_feedback(request.text)
    except Exception as e:
        logger.error(f"Feedback analysis error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Feedback analysis failed")


@problem_router.post("/problem/analyze")
async def process_problem_statement(request: ProblemStatementRequest):
    """Analyze a project proposal for feasibility, innovation, scope, and clarity."""
    try:
        return await analyze_problem_statement(
            title=request.title,
            description=request.description,
            tech_stack=request.tech_stack,
            domain=request.domain
        )
    except Exception as e:
        logger.error(f"Problem analysis error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Problem statement analysis failed")
