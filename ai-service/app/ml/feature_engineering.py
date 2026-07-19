"""
Centralized Feature Engineering for CapstoneX ML Pipelines.
Provides consistent feature extraction for training and inference.
Ensures training features match inference features exactly.
"""
import logging
import re
from typing import List, Dict, Optional, Tuple
import numpy as np

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────
# Feature Definitions
# ──────────────────────────────────────────

RISK_FEATURE_NAMES = [
    "submission_rate",
    "avg_days_late",
    "mentor_feedback_score",
    "login_frequency_7d",
    "evaluation_score_avg",
    "group_size",
    "topic_approval_delay_days",
    "total_logbooks",
    "total_meetings",
    "completed_meetings",
    "mentor_meeting_frequency",
    "task_completion_rate",
    "feedback_approval_rate",
    "eval_count",
    "eval_min_score",
]

RISK_FEATURE_DEFAULTS = {
    "submission_rate": 0.5,
    "avg_days_late": 3.0,
    "mentor_feedback_score": 5.0,
    "login_frequency_7d": 10,
    "evaluation_score_avg": 50.0,
    "group_size": 4,
    "topic_approval_delay_days": 5.0,
    "total_logbooks": 0,
    "total_meetings": 0,
    "completed_meetings": 0,
    "mentor_meeting_frequency": 0.0,
    "task_completion_rate": 0.5,
    "feedback_approval_rate": 0.5,
    "eval_count": 0,
    "eval_min_score": 0.0,
}

# Complex tech keywords for feasibility estimation
COMPLEX_TECH = {
    "blockchain", "ai", "ml", "deep learning", "computer vision", "nlp",
    "iot", "robotics", "kubernetes", "microservices", "distributed systems",
    "real-time", "streaming", "quantum", "federated learning", "edge computing",
}

# Trending tech for innovation scoring
TRENDING_TECH = {
    "ai", "llm", "gpt", "generative", "blockchain", "web3", "quantum",
    "ar", "vr", "metaverse", "edge computing", "iot", "5g", "green tech",
    "rust", "wasm", "serverless", "vector database", "rag",
}


def extract_risk_features(features_dict: Dict) -> np.ndarray:
    """
    Extract risk features in consistent order from a dict.
    Uses defaults for missing features.

    Args:
        features_dict: Dict with feature names as keys

    Returns:
        numpy array of shape (n_features,)
    """
    values = []
    for name in RISK_FEATURE_NAMES:
        val = features_dict.get(name, RISK_FEATURE_DEFAULTS.get(name, 0))
        values.append(float(val) if val is not None else 0.0)
    return np.array(values, dtype=np.float32)


def extract_project_text_features(description: str) -> Dict[str, float]:
    """
    Extract numerical features from project description text.
    Used by scoring engine for ML model input.
    """
    if not description:
        return {
            "text_length": 0, "sentence_count": 0, "avg_sentence_length": 0,
            "tech_keyword_count": 0, "complexity_score": 0, "trend_score": 0,
            "has_quantitative_claims": 0,
        }

    desc_lower = description.lower()
    sentences = [s.strip() for s in re.split(r'[.!?]+', description) if s.strip()]

    # Count tech complexity signals
    tech_count = sum(1 for t in COMPLEX_TECH if t in desc_lower)

    # Count trending tech signals
    trend_count = sum(1 for t in TRENDING_TECH if t in desc_lower)

    # Quantitative claims (numbers, percentages, metrics)
    has_quant = 1 if re.search(r'\d+%|\d+\s*(users?|reduction|increase|improve)', desc_lower) else 0

    return {
        "text_length": len(description),
        "sentence_count": len(sentences),
        "avg_sentence_length": len(description) / max(len(sentences), 1),
        "tech_keyword_count": tech_count,
        "complexity_score": min(10, tech_count * 2),
        "trend_score": min(10, trend_count * 2),
        "has_quantitative_claims": has_quant,
    }


def extract_scoring_features(
    project_description: str,
    project_domain: str,
    student_department: str,
    student_skills: List[str],
    tech_stack: List[str],
    target_audience: str,
    expected_impact: str,
    expected_users: str,
    duration: str,
    team_size: int,
    max_similarity: float,
    similar_count: int,
) -> np.ndarray:
    """
    Extract features for ML scoring model.
    Returns a flat feature vector for prediction.
    """
    desc_features = extract_project_text_features(project_description)
    tech_lower = [t.lower() for t in (tech_stack or [])]
    skills_lower = [s.lower() for s in (student_skills or [])]

    # Tech-skill overlap ratio
    if tech_lower and skills_lower:
        overlap = len(set(tech_lower) & set(skills_lower))
        skill_match_ratio = overlap / len(set(tech_lower))
    else:
        skill_match_ratio = 0.5

    # Duration estimation
    duration_days = _estimate_duration_days(duration)

    features = [
        desc_features["text_length"],
        desc_features["sentence_count"],
        desc_features["tech_keyword_count"],
        desc_features["complexity_score"],
        desc_features["trend_score"],
        desc_features["has_quantitative_claims"],
        len(tech_stack or []),
        len(student_skills or []),
        skill_match_ratio,
        team_size or 1,
        duration_days,
        max_similarity,
        similar_count,
        len(target_audience or ""),
        len(expected_impact or ""),
    ]

    return np.array(features, dtype=np.float32)


SCORING_FEATURE_NAMES = [
    "text_length", "sentence_count", "tech_keyword_count",
    "complexity_score", "trend_score", "has_quantitative_claims",
    "tech_stack_size", "skills_count", "skill_match_ratio",
    "team_size", "duration_days", "max_similarity", "similar_count",
    "target_audience_length", "expected_impact_length",
]


def extract_team_features(student: Dict) -> np.ndarray:
    """
    Extract features for team formation from a student profile.
    """
    skills = student.get("skills") or []
    interests = student.get("interests") or []

    return np.array([
        len(skills),
        len(interests),
        student.get("cgpa", 0) or 0,
        student.get("leadership_score", 5) or 5,
        student.get("reliability_score", 5) or 5,
        student.get("communication_score", 5) or 5,
        student.get("github_activity", 0) or 0,
        student.get("past_project_performance", 50) or 50,
        student.get("availability_score", 10) or 10,
    ], dtype=np.float32)


TEAM_FEATURE_NAMES = [
    "skill_count", "interest_count", "cgpa", "leadership_score",
    "reliability_score", "communication_score", "github_activity",
    "past_project_performance", "availability_score",
]


def _estimate_duration_days(duration: str) -> float:
    """Estimate project duration in days from text description."""
    if not duration:
        return 30.0
    duration_lower = duration.lower()
    if any(w in duration_lower for w in ["24 hour", "1 day", "24h"]):
        return 1.0
    elif any(w in duration_lower for w in ["48 hour", "2 day", "weekend"]):
        return 2.0
    elif any(w in duration_lower for w in ["1 week", "7 day"]):
        return 7.0
    elif any(w in duration_lower for w in ["2 week"]):
        return 14.0
    elif any(w in duration_lower for w in ["1 month", "30 day", "4 week"]):
        return 30.0
    elif any(w in duration_lower for w in ["semester", "6 month", "3 month"]):
        return 120.0
    elif any(w in duration_lower for w in ["1 year", "12 month"]):
        return 365.0
    return 30.0


def compute_jaccard_similarity(set_a: set, set_b: set) -> float:
    """Compute Jaccard similarity between two sets."""
    if not set_a or not set_b:
        return 0.0
    intersection = len(set_a & set_b)
    union = len(set_a | set_b)
    return intersection / union if union > 0 else 0.0
