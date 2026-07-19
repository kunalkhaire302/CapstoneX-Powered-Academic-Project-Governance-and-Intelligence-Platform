"""
FastAPI Router for Problem Statement Recommendation API.

Endpoints:
  POST /api/ai/problem/analyze     — Full 12-step analysis
  GET  /api/ai/problem/similar/:id — Find similar projects
  POST /api/ai/problem/improve     — Improvement suggestions only
  POST /api/ai/problem/rescore     — Re-analyze after changes
"""
from fastapi import APIRouter, HTTPException
from app.models.problem_statement_schemas import (
    ProblemStatementInput,
    RecommendationReport,
    ImproveRequest,
    ImproveResponse,
    RescoreRequest,
)
from app.services.problem_analyzer_service import (
    analyze_problem_statement,
    improve_problem_statement,
)
from app.services.embedding_service import generate_embedding, combine_text_for_embedding
from app.services.vector_store import search_similar
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/problem/analyze", response_model=RecommendationReport)
async def analyze_problem(request: ProblemStatementInput):
    """
    Full 12-step problem statement analysis.
    Returns comprehensive recommendation report with scores,
    similar projects, and AI suggestions.
    """
    try:
        logger.info(f"Analyzing problem statement: {request.title}")
        report = await analyze_problem_statement(
            title=request.title,
            problem_statement=request.problem_statement,
            description=request.description,
            domain=request.domain,
            department=request.department,
            skills=request.skills,
            tech_stack=request.tech_stack,
            team_members=request.team_members,
            hackathon_theme=request.hackathon_theme,
            expected_users=request.expected_users,
            target_audience=request.target_audience,
            expected_impact=request.expected_impact,
            duration=request.duration,
        )
        return report
    except Exception as e:
        logger.error(f"Problem analysis error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.get("/problem/similar/{project_id}")
async def find_similar_projects(project_id: str, top_k: int = 10):
    """
    Find projects similar to a given project by ID.
    Uses embedding-based similarity search via FAISS.
    """
    try:
        # For now, we search by generating an embedding from the project_id
        # In production, this would look up the stored embedding by ID
        from app.services.vector_store import _project_metadata

        # Find the project in our metadata
        target_project = None
        for proj in _project_metadata:
            if proj.get("id") == project_id:
                target_project = proj
                break

        if not target_project:
            raise HTTPException(status_code=404, detail=f"Project {project_id} not found in index")

        # Generate embedding for this project
        text = combine_text_for_embedding(
            title=target_project.get("title", ""),
            description=target_project.get("description", ""),
            domain=target_project.get("domain", ""),
            tech_stack=target_project.get("tech_stack", []),
        )
        embedding = generate_embedding(text)

        # Search excluding self
        results = search_similar(embedding, top_k=top_k, exclude_ids=[project_id])

        similar = []
        for proj, similarity in results:
            similar.append({
                "id": proj.get("id", ""),
                "title": proj.get("title", "Unknown"),
                "domain": proj.get("domain", ""),
                "similarity": similarity,
                "reason": f"Shares semantic similarity in project scope and approach.",
            })

        return {"similar_projects": similar, "total_compared": len(_project_metadata)}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Similar projects search error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@router.post("/problem/improve", response_model=ImproveResponse)
async def improve_problem(request: ImproveRequest):
    """
    Generate improvement-focused suggestions without full re-analysis.
    Faster endpoint for the "Improve Idea" button.
    """
    try:
        result = await improve_problem_statement(
            title=request.title,
            problem_statement=request.problem_statement,
            description=request.description,
            domain=request.domain,
            tech_stack=request.tech_stack,
            scores=request.scores,
            similar_projects=request.similar_projects,
        )
        return result
    except Exception as e:
        logger.error(f"Improve suggestions error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Improvement generation failed: {str(e)}")


@router.post("/problem/rescore", response_model=RecommendationReport)
async def rescore_problem(request: RescoreRequest):
    """
    Re-analyze a problem statement after changes.
    Same as full analysis but tagged as a rescore action.
    """
    try:
        logger.info(f"Re-scoring problem statement: {request.title}")
        report = await analyze_problem_statement(
            title=request.title,
            problem_statement=request.problem_statement,
            description=request.description,
            domain=request.domain,
            department=request.department,
            skills=request.skills,
            tech_stack=request.tech_stack,
            team_members=request.team_members,
            hackathon_theme=request.hackathon_theme,
            expected_users=request.expected_users,
            target_audience=request.target_audience,
            expected_impact=request.expected_impact,
            duration=request.duration,
        )
        return report
    except Exception as e:
        logger.error(f"Rescore error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Rescore failed: {str(e)}")
