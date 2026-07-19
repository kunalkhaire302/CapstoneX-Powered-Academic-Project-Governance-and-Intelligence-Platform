"""
Student Profile Builder for CapstoneX Recommendation Engine.
Builds comprehensive student feature vectors from database and input data.
"""
import logging
from typing import Dict, List, Optional
import numpy as np

from app.services.embedding_service import generate_embedding

logger = logging.getLogger(__name__)


def build_profile_embedding(
    skills: List[str],
    interests: List[str],
    technologies: List[str],
    department: str = "",
    cgpa: float = 0.0,
) -> np.ndarray:
    """
    Build a dense embedding from student profile text.
    Combines skills, interests, tech preferences, and department into one vector.
    """
    parts = []
    if skills:
        parts.append(f"Skills: {', '.join(skills)}.")
    if interests:
        parts.append(f"Interests: {', '.join(interests)}.")
    if technologies:
        parts.append(f"Technologies: {', '.join(technologies)}.")
    if department:
        parts.append(f"Department: {department}.")

    profile_text = " ".join(parts)
    if not profile_text.strip():
        profile_text = "general computer science student"

    return generate_embedding(profile_text)


def compute_tech_overlap(student_tech: List[str], project_tech: List[str]) -> float:
    """Compute technology overlap score between student and project."""
    if not student_tech or not project_tech:
        return 0.0

    student_set = set(t.lower().strip() for t in student_tech)
    project_set = set(t.lower().strip() for t in project_tech)

    # Jaccard similarity
    intersection = len(student_set & project_set)
    union = len(student_set | project_set)
    return intersection / union if union > 0 else 0.0


def compute_difficulty_match(
    project_tech_count: int,
    project_complexity_keywords: int,
    student_skill_count: int,
    student_cgpa: float = 0.0,
) -> float:
    """
    Estimate how well student capability matches project difficulty.
    Returns 0-1 where 1 = perfect match, <0.5 = underskilled, >0.8 = might be unchallenging.
    """
    # Simple capability estimation
    capability = (student_skill_count / 10.0) * 0.6 + (student_cgpa / 10.0) * 0.4
    capability = min(1.0, max(0.0, capability))

    # Project difficulty estimation
    difficulty = min(1.0, (project_tech_count / 8.0) * 0.5 + (project_complexity_keywords / 5.0) * 0.5)

    # Match is best when capability meets difficulty (not too easy, not too hard)
    diff = abs(capability - difficulty)
    return max(0.0, 1.0 - diff)


def compute_novelty_score(
    similarity_scores: List[float],
    popularity_count: int = 0,
) -> float:
    """
    Compute novelty score for a recommendation.
    Less popular + less similar to student's history = more novel.

    Args:
        similarity_scores: Cosine similarities from FAISS search
        popularity_count: How many students have chosen similar projects

    Returns:
        Novelty score 0-1
    """
    if not similarity_scores:
        return 0.8  # Unknown = moderately novel

    # Inverse of average similarity to student profile
    avg_sim = sum(similarity_scores) / len(similarity_scores)
    sim_novelty = 1.0 - min(1.0, avg_sim)

    # Popularity penalty
    pop_novelty = 1.0 / (1.0 + popularity_count * 0.1)

    return round(sim_novelty * 0.6 + pop_novelty * 0.4, 3)


def build_student_profile_dict(
    student_id: str,
    skills: List[str],
    interests: List[str],
    technologies: List[str],
    department: str = "",
    db_profile: Optional[Dict] = None,
) -> Dict:
    """
    Build a comprehensive student profile dict combining input and database data.
    """
    profile = {
        "id": student_id,
        "skills": skills or [],
        "interests": interests or [],
        "technologies": technologies or [],
        "department": department,
    }

    if db_profile:
        profile.update({
            "name": db_profile.get("name", ""),
            "avg_evaluation_score": db_profile.get("avg_evaluation_score"),
            "evaluation_count": db_profile.get("evaluation_count", 0),
            "groups_participated": db_profile.get("groups_participated", 0),
            # Merge skills from DB if not provided
            "skills": skills or db_profile.get("skills", []),
            "interests": interests or db_profile.get("interests", []),
            "department": department or db_profile.get("department", ""),
        })

    return profile
