"""
Module 1: Project Recommendation Engine — PRODUCTION VERSION
Uses FAISS semantic search over the full project corpus instead of hardcoded domains.

Architecture:
    1. Build student profile embedding from skills/interests/tech
    2. Search FAISS index for semantically similar projects
    3. Rank by multi-factor scoring: similarity, novelty, tech overlap,
       difficulty match, completion rate, department relevance, trends
    4. Generate explainable recommendations with reasons

Data Sources:
    - Approved topics (current and past semesters)
    - Previous year capstone projects
    - Problem statements in the system
    - Seed projects (initial dataset)
"""
import logging
from typing import List, Dict, Optional
import numpy as np

from app.services.embedding_service import generate_embedding
from app.services.vector_store import search_similar, get_total_projects
from app.services.student_profiler import (
    build_profile_embedding,
    compute_tech_overlap,
    compute_difficulty_match,
    compute_novelty_score,
    build_student_profile_dict,
)
from app.ml.feature_engineering import COMPLEX_TECH, TRENDING_TECH

logger = logging.getLogger(__name__)


async def get_recommendations(
    student_id: str,
    skills: List[str],
    interests: List[str],
    technologies: List[str],
    department: str = "",
    cgpa: float = 0.0,
    top_k: int = 10,
) -> dict:
    """
    Generate project recommendations using FAISS semantic search
    with multi-factor ranking.

    Args:
        student_id: Unique student identifier
        skills: Student's listed skills
        interests: Student's interests
        technologies: Preferred technologies
        department: Student's academic department
        cgpa: Student's CGPA (optional)
        top_k: Number of recommendations to return

    Returns:
        Dict with ranked recommendations, each with explainable reasons
    """
    # Try to enrich profile from database
    db_profile = None
    try:
        from app.core.database import get_student_profile
        db_profile = await get_student_profile(student_id)
    except Exception as e:
        logger.debug(f"DB profile lookup skipped: {e}")

    student_profile = build_student_profile_dict(
        student_id, skills, interests, technologies, department, db_profile,
    )

    # Build student embedding
    student_emb = build_profile_embedding(
        student_profile["skills"],
        student_profile["interests"],
        student_profile.get("technologies", technologies),
        student_profile["department"],
        cgpa,
    )

    total_projects = get_total_projects()

    if total_projects == 0:
        logger.warning("Vector store is empty — returning empty recommendations")
        return {
            "recommendations": [],
            "total_projects_searched": 0,
            "model_version": "4.0-faiss-multifactor",
            "explanation": "No projects in the index yet. Add projects to get recommendations.",
        }

    # Search FAISS for similar projects
    raw_results = search_similar(student_emb, top_k=top_k * 3)  # Fetch extra for re-ranking

    if not raw_results:
        return {
            "recommendations": [],
            "total_projects_searched": total_projects,
            "model_version": "4.0-faiss-multifactor",
            "explanation": "No matching projects found for your profile.",
        }

    # Multi-factor re-ranking
    scored_results = []
    for project, similarity_pct in raw_results:
        project_tech = project.get("tech_stack", [])
        project_domain = project.get("domain", "")

        # Factor 1: Semantic similarity (from FAISS)
        similarity_score = min(similarity_pct / 100.0, 1.0)

        # Factor 2: Technology overlap
        tech_overlap = compute_tech_overlap(
            student_profile.get("technologies", []) + student_profile.get("skills", []),
            project_tech,
        )

        # Factor 3: Difficulty match
        project_desc = project.get("description", "")
        desc_lower = (project_desc + " " + project_domain).lower()
        complexity_keywords = sum(1 for t in COMPLEX_TECH if t in desc_lower)
        difficulty_match = compute_difficulty_match(
            len(project_tech), complexity_keywords,
            len(student_profile.get("skills", [])), cgpa,
        )

        # Factor 4: Department relevance
        dept_relevance = 0.0
        student_dept = (student_profile.get("department") or "").lower()
        if student_dept and student_dept in project_domain.lower():
            dept_relevance = 1.0
        elif student_dept:
            # Check for partial match
            dept_words = student_dept.split()
            if any(w in project_domain.lower() for w in dept_words if len(w) > 3):
                dept_relevance = 0.5

        # Factor 5: Trend alignment
        trend_count = sum(1 for t in TRENDING_TECH if t in desc_lower)
        trend_score = min(1.0, trend_count * 0.2)

        # Weighted composite score
        composite = (
            similarity_score * 0.35 +
            tech_overlap * 0.20 +
            difficulty_match * 0.15 +
            dept_relevance * 0.10 +
            trend_score * 0.10 +
            0.10  # base relevance bonus
        )

        # Generate explanation
        reason_parts = []
        if similarity_score > 0.6:
            reason_parts.append(f"Strong semantic match with your profile ({similarity_pct:.0f}% similarity)")
        elif similarity_score > 0.3:
            reason_parts.append(f"Moderate alignment with your interests ({similarity_pct:.0f}% similarity)")

        if tech_overlap > 0.3:
            matching_tech = set(t.lower() for t in student_profile.get("technologies", [])) & \
                           set(t.lower() for t in project_tech)
            if matching_tech:
                reason_parts.append(f"Overlapping tech: {', '.join(list(matching_tech)[:3])}")

        if difficulty_match > 0.6:
            reason_parts.append("Good difficulty match for your skill level")

        if dept_relevance > 0.5:
            reason_parts.append(f"Relevant to your {student_profile.get('department', '')} department")

        if trend_score > 0.3:
            reason_parts.append("Uses trending technologies")

        if not reason_parts:
            reason_parts.append(f"Aligns with your overall profile. {project.get('description', '')[:100]}")

        # Estimate difficulty
        difficulty = _estimate_difficulty(project_tech, complexity_keywords)

        scored_results.append({
            "project": project,
            "composite_score": composite,
            "similarity_score": similarity_score,
            "tech_overlap": tech_overlap,
            "difficulty_match": difficulty_match,
            "dept_relevance": dept_relevance,
            "trend_score": trend_score,
            "reason": ". ".join(reason_parts) + ".",
            "difficulty": difficulty,
        })

    # Sort by composite score descending
    scored_results.sort(key=lambda x: x["composite_score"], reverse=True)

    # Compute novelty scores (now that we have the ranking)
    similarity_scores_list = [r["similarity_score"] for r in scored_results]

    # Build final recommendations
    recommendations = []
    for rank, result in enumerate(scored_results[:top_k]):
        project = result["project"]
        novelty = compute_novelty_score(
            similarity_scores_list[rank:rank+3] if rank < len(similarity_scores_list) else [],
            popularity_count=rank,
        )

        recommendations.append({
            "project_id": project.get("id", ""),
            "title": project.get("title", "Unknown Project"),
            "domain": project.get("domain", ""),
            "description": (project.get("description", ""))[:200],
            "tech_stack": project.get("tech_stack", []),
            "match_score": round(min(result["composite_score"], 0.99), 3),
            "novelty_score": round(novelty, 3),
            "difficulty": result["difficulty"],
            "reason": result["reason"],
            "ranking_factors": {
                "semantic_similarity": round(result["similarity_score"], 3),
                "tech_overlap": round(result["tech_overlap"], 3),
                "difficulty_match": round(result["difficulty_match"], 3),
                "department_relevance": round(result["dept_relevance"], 3),
                "trend_alignment": round(result["trend_score"], 3),
            },
        })

    return {
        "recommendations": recommendations,
        "total_projects_searched": total_projects,
        "student_profile_used": {
            "skills_count": len(student_profile.get("skills", [])),
            "interests_count": len(student_profile.get("interests", [])),
            "department": student_profile.get("department", ""),
        },
        "model_version": "4.0-faiss-multifactor",
    }


def _estimate_difficulty(tech_stack: List[str], complexity_keyword_count: int) -> str:
    """Estimate project difficulty from tech stack and complexity signals."""
    tech_lower = [t.lower() for t in (tech_stack or [])]
    complex_count = sum(1 for t in tech_lower if any(c in t for c in COMPLEX_TECH))

    total_complexity = complex_count + complexity_keyword_count
    if total_complexity >= 4:
        return "Hard"
    elif total_complexity >= 2:
        return "Medium-Hard"
    elif total_complexity >= 1 or len(tech_stack or []) >= 4:
        return "Medium"
    else:
        return "Easy-Medium"


# ──────────────────────────────────────────
# Synchronous wrapper for backward compatibility
# ──────────────────────────────────────────

def get_recommendations_sync(
    student_id: str,
    skills: List[str],
    interests: List[str],
    technologies: List[str],
) -> dict:
    """
    Synchronous fallback for the recommendation engine.
    Used when async context is not available.
    """
    import asyncio
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    if loop and loop.is_running():
        # We're inside an async context — create a task
        import concurrent.futures
        with concurrent.futures.ThreadPoolExecutor() as pool:
            result = pool.submit(
                asyncio.run,
                get_recommendations(student_id, skills, interests, technologies)
            ).result()
            return result
    else:
        return asyncio.run(
            get_recommendations(student_id, skills, interests, technologies)
        )
