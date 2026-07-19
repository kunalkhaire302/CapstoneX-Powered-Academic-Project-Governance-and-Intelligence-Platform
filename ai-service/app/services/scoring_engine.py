"""
Scoring Engine for Problem Statement Recommendation.
Calculates 8 recommendation scores (0-100) using a hybrid approach:
- Embedding-based similarity for uniqueness and domain match
- Rule-based heuristics for feasibility, skill match, impact
- Combined weighted score for overall recommendation

Score Dimensions:
1. Domain Match (0-100)     — How well the project aligns with the student's domain
2. Uniqueness (0-100)       — How different the idea is from existing projects
3. Innovation (0-100)       — Novelty + trend alignment + creative approach
4. Impact (0-100)           — Real-world value, SDG alignment, user reach
5. Feasibility (0-100)      — Can the team build this in the given time?
6. Skill Match (0-100)      — Do the team's skills cover the tech requirements?
7. Commercial Potential (0-100) — Market viability and business potential
8. Overall (0-100)          — Weighted average of all scores
"""
import logging
from typing import List, Dict, Optional, Tuple

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────────────────
# Score Weight Configuration (must sum to 1.0)
# ──────────────────────────────────────────────────────────
SCORE_WEIGHTS = {
    "domain_match": 0.12,
    "uniqueness": 0.18,
    "innovation": 0.15,
    "impact": 0.15,
    "feasibility": 0.15,
    "skill_match": 0.10,
    "commercial_potential": 0.10,
    # Remaining 0.05 is a bonus for completeness of submission
}

# ──────────────────────────────────────────────────────────
# Domain Taxonomy for matching
# ──────────────────────────────────────────────────────────
DOMAIN_TAXONOMY = {
    "machine learning": ["ai", "ml", "deep learning", "neural network", "prediction", "classification", "nlp", "computer vision", "tensorflow", "pytorch", "data science"],
    "web development": ["web", "frontend", "backend", "fullstack", "react", "angular", "vue", "node", "express", "django", "flask", "rest", "api", "javascript", "html", "css", "next.js"],
    "mobile development": ["mobile", "android", "ios", "flutter", "react native", "kotlin", "swift", "app"],
    "data science": ["data", "analytics", "visualization", "pandas", "numpy", "statistics", "eda", "dashboard", "bigdata", "etl"],
    "cybersecurity": ["security", "cyber", "encryption", "authentication", "vulnerability", "penetration", "firewall", "blockchain", "threat"],
    "cloud computing": ["cloud", "aws", "azure", "gcp", "docker", "kubernetes", "devops", "ci/cd", "microservices", "serverless"],
    "iot": ["iot", "embedded", "raspberry pi", "arduino", "sensor", "hardware", "mqtt", "edge computing"],
    "blockchain": ["blockchain", "ethereum", "solidity", "smart contract", "decentralized", "web3", "crypto", "defi", "nft"],
    "nlp": ["nlp", "natural language", "text mining", "sentiment", "chatbot", "language model", "transformers", "bert", "gpt", "llm"],
    "computer vision": ["computer vision", "image processing", "object detection", "face recognition", "opencv", "cnn", "segmentation", "medical imaging"],
    "healthcare": ["health", "medical", "clinical", "patient", "diagnosis", "telemedicine", "drug", "pharmaceutical", "hospital"],
    "education": ["education", "learning", "e-learning", "student", "course", "lms", "edtech", "assessment", "classroom"],
    "fintech": ["finance", "fintech", "banking", "payment", "trading", "insurance", "credit", "loan", "investment"],
    "sustainability": ["environment", "sustainability", "green", "renewable", "energy", "climate", "waste", "recycling", "carbon"],
    "robotics": ["robot", "automation", "drone", "autonomous", "manipulator", "navigation", "ros"],
}

# SDG keywords for alignment scoring
SDG_KEYWORDS = {
    "SDG 1 - No Poverty": ["poverty", "economic", "income", "financial inclusion"],
    "SDG 2 - Zero Hunger": ["hunger", "food", "agriculture", "nutrition", "farming"],
    "SDG 3 - Good Health": ["health", "medical", "disease", "wellness", "healthcare", "patient"],
    "SDG 4 - Quality Education": ["education", "learning", "student", "school", "training", "literacy"],
    "SDG 5 - Gender Equality": ["gender", "women", "equality", "empowerment", "inclusion"],
    "SDG 6 - Clean Water": ["water", "sanitation", "clean water", "hygiene"],
    "SDG 7 - Affordable Energy": ["energy", "renewable", "solar", "wind", "electricity"],
    "SDG 8 - Decent Work": ["employment", "job", "work", "economic growth", "labor"],
    "SDG 9 - Industry & Innovation": ["industry", "innovation", "infrastructure", "technology", "manufacturing"],
    "SDG 10 - Reduced Inequalities": ["inequality", "inclusion", "accessibility", "disability"],
    "SDG 11 - Sustainable Cities": ["city", "urban", "transport", "smart city", "housing"],
    "SDG 12 - Responsible Consumption": ["consumption", "waste", "recycling", "sustainable", "circular"],
    "SDG 13 - Climate Action": ["climate", "carbon", "emission", "environment", "warming"],
    "SDG 14 - Life Below Water": ["ocean", "marine", "fisheries", "aquatic"],
    "SDG 15 - Life on Land": ["forest", "biodiversity", "land", "ecosystem", "wildlife"],
    "SDG 16 - Peace & Justice": ["peace", "justice", "governance", "corruption", "institution"],
    "SDG 17 - Partnerships": ["partnership", "cooperation", "global", "collaboration"],
}

# Complexity signals for feasibility estimation
COMPLEX_TECH = ["blockchain", "ai", "ml", "deep learning", "computer vision", "nlp", "iot", "robotics",
                "kubernetes", "microservices", "distributed systems", "real-time", "streaming"]


def calculate_domain_match(
    project_domain: str,
    project_description: str,
    student_department: str,
    student_skills: List[str],
) -> int:
    """
    Score how well the project aligns with the student's academic domain.
    Uses keyword matching against domain taxonomy.

    Returns: 0-100
    """
    if not project_domain and not project_description:
        return 50  # Neutral if no data

    combined = f"{project_domain} {project_description} {' '.join(student_skills)}".lower()

    best_match = 0
    matched_domain = ""
    for domain, keywords in DOMAIN_TAXONOMY.items():
        match_count = sum(1 for kw in keywords if kw in combined)
        match_pct = match_count / len(keywords) if keywords else 0
        if match_pct > best_match:
            best_match = match_pct
            matched_domain = domain

    # Boost if student department aligns
    dept_lower = (student_department or "").lower()
    dept_bonus = 0
    if dept_lower:
        for domain, keywords in DOMAIN_TAXONOMY.items():
            if any(kw in dept_lower for kw in keywords[:3]):
                if domain == matched_domain:
                    dept_bonus = 15
                break

    # Boost if student skills overlap with project tech
    skill_overlap = sum(1 for s in student_skills if s.lower() in combined) / max(len(student_skills), 1)
    skill_bonus = int(skill_overlap * 20)

    score = int(min(100, best_match * 70 + dept_bonus + skill_bonus))
    return max(10, score)


def calculate_uniqueness(similar_projects: List[Tuple[Dict, float]]) -> int:
    """
    Score uniqueness based on similarity to existing projects.
    Lower max similarity = higher uniqueness score.

    Returns: 0-100
    """
    if not similar_projects:
        return 85  # High uniqueness if nothing similar found

    max_similarity = max(s for _, s in similar_projects)

    # Inverse mapping: 100% similar → 0 unique, 0% similar → 100 unique
    if max_similarity >= 95:
        return 5
    elif max_similarity >= 90:
        return 15
    elif max_similarity >= 80:
        return 30
    elif max_similarity >= 70:
        return 45
    elif max_similarity >= 60:
        return 60
    elif max_similarity >= 50:
        return 70
    elif max_similarity >= 30:
        return 80
    else:
        return 90


def calculate_innovation(
    uniqueness_score: int,
    project_description: str,
    tech_stack: List[str],
) -> int:
    """
    Score innovation based on uniqueness, trend alignment, and creative signals.

    Returns: 0-100
    """
    description_lower = (project_description or "").lower()
    tech_lower = [t.lower() for t in (tech_stack or [])]

    # Base from uniqueness (40% weight)
    base = uniqueness_score * 0.4

    # Trend bonus — modern/trending technologies (up to 25 pts)
    trending_tech = ["ai", "llm", "gpt", "generative", "blockchain", "web3", "quantum",
                     "ar", "vr", "metaverse", "edge computing", "iot", "5g", "green tech"]
    trend_hits = sum(1 for t in trending_tech if t in description_lower or t in " ".join(tech_lower))
    trend_bonus = min(25, trend_hits * 8)

    # Creativity signals (up to 20 pts)
    creative_signals = ["novel", "innovative", "unique", "first", "patent", "breakthrough",
                        "new approach", "interdisciplinary", "cross-domain", "hybrid"]
    creativity = sum(1 for s in creative_signals if s in description_lower)
    creativity_bonus = min(20, creativity * 7)

    # Problem complexity bonus (up to 15 pts)
    complex_signals = ["real-time", "scalable", "distributed", "multi-modal", "federated", "autonomous"]
    complexity = sum(1 for s in complex_signals if s in description_lower)
    complexity_bonus = min(15, complexity * 5)

    score = int(min(100, base + trend_bonus + creativity_bonus + complexity_bonus))
    return max(10, score)


def calculate_impact(
    project_description: str,
    target_audience: str,
    expected_impact: str,
    expected_users: str,
) -> Tuple[int, List[str]]:
    """
    Score real-world impact and identify SDG alignment.

    Returns: (score 0-100, list of aligned SDGs)
    """
    combined = f"{project_description} {target_audience} {expected_impact} {expected_users}".lower()

    # SDG alignment (up to 30 pts)
    aligned_sdgs = []
    for sdg, keywords in SDG_KEYWORDS.items():
        if any(kw in combined for kw in keywords):
            aligned_sdgs.append(sdg)
    sdg_score = min(30, len(aligned_sdgs) * 10)

    # Target audience breadth (up to 25 pts)
    audience_signals = {
        "large": ["everyone", "public", "global", "millions", "nationwide", "all users"],
        "medium": ["students", "businesses", "hospitals", "schools", "farmers", "community"],
        "small": ["team", "department", "company", "internal"],
    }
    audience_score = 15  # default medium
    for level, signals in audience_signals.items():
        if any(s in combined for s in signals):
            audience_score = {"large": 25, "medium": 18, "small": 10}[level]
            break

    # Impact depth signals (up to 25 pts)
    impact_signals = ["save lives", "reduce cost", "improve efficiency", "prevent", "automate",
                      "accessibility", "sustainability", "environmental", "social good", "safety"]
    impact_depth = sum(1 for s in impact_signals if s in combined)
    depth_score = min(25, impact_depth * 8)

    # Description quality bonus (up to 20 pts)
    quality_score = min(20, len(expected_impact.split()) // 5) if expected_impact else 5

    total = int(min(100, sdg_score + audience_score + depth_score + quality_score))
    return max(10, total), aligned_sdgs


def calculate_feasibility(
    tech_stack: List[str],
    team_size: int,
    duration: str,
    description: str,
) -> int:
    """
    Score feasibility — can the team realistically build this?

    Returns: 0-100
    """
    # Complexity estimation from tech stack
    tech_lower = [t.lower() for t in (tech_stack or [])]
    complex_count = sum(1 for t in tech_lower if any(c in t for c in COMPLEX_TECH))
    tech_count = len(tech_lower)

    complexity_penalty = complex_count * 8 + max(0, (tech_count - 4)) * 5

    # Duration estimation
    duration_lower = (duration or "").lower()
    duration_days = 30  # default
    if any(w in duration_lower for w in ["24 hour", "1 day", "24h"]):
        duration_days = 1
    elif any(w in duration_lower for w in ["48 hour", "2 day", "weekend"]):
        duration_days = 2
    elif any(w in duration_lower for w in ["1 week", "7 day"]):
        duration_days = 7
    elif any(w in duration_lower for w in ["2 week"]):
        duration_days = 14
    elif any(w in duration_lower for w in ["1 month", "30 day", "4 week"]):
        duration_days = 30
    elif any(w in duration_lower for w in ["semester", "6 month", "3 month"]):
        duration_days = 120

    # More time = more feasible
    time_bonus = min(30, duration_days * 0.5)

    # Team size factor
    team_bonus = min(15, (team_size or 1) * 4)

    # Scope signals
    desc_lower = (description or "").lower()
    overscope_signals = ["entire platform", "complete solution", "all-in-one", "everything",
                         "full ecosystem", "production-ready", "enterprise-grade"]
    overscope_penalty = sum(5 for s in overscope_signals if s in desc_lower)

    score = int(max(10, min(100, 70 - complexity_penalty + time_bonus + team_bonus - overscope_penalty)))
    return score


def calculate_skill_match(
    required_tech: List[str],
    student_skills: List[str],
    team_members_skills: Optional[List[List[str]]] = None,
) -> int:
    """
    Score how well the team's skills cover the project requirements.

    Returns: 0-100
    """
    if not required_tech:
        return 75  # No requirements specified = assume match

    # Combine all available skills
    all_skills = set(s.lower().strip() for s in (student_skills or []))
    if team_members_skills:
        for member_skills in team_members_skills:
            all_skills.update(s.lower().strip() for s in (member_skills or []))

    if not all_skills:
        return 30  # No skills listed

    required_lower = set(t.lower().strip() for t in required_tech)

    # Exact matches
    exact_matches = required_lower & all_skills

    # Fuzzy matches (partial overlap)
    fuzzy_matches = 0
    for req in required_lower - exact_matches:
        for skill in all_skills:
            if req in skill or skill in req:
                fuzzy_matches += 0.5
                break

    total_match = len(exact_matches) + fuzzy_matches
    match_ratio = total_match / len(required_lower) if required_lower else 0

    score = int(min(100, match_ratio * 90 + 10))
    return max(10, score)


def calculate_commercial_potential(
    project_description: str,
    target_audience: str,
    expected_users: str,
    domain: str,
) -> int:
    """
    Score the commercial/market viability of the project.

    Returns: 0-100
    """
    combined = f"{project_description} {target_audience} {expected_users} {domain}".lower()

    # Market signals (up to 30 pts)
    market_signals = ["revenue", "monetize", "saas", "subscription", "marketplace", "e-commerce",
                      "b2b", "b2c", "startup", "business model", "profit", "scalable", "market"]
    market_score = min(30, sum(8 for s in market_signals if s in combined))

    # Target market size signals (up to 25 pts)
    large_market = ["enterprise", "global", "millions", "industry", "nationwide"]
    medium_market = ["businesses", "companies", "organizations", "schools"]
    if any(s in combined for s in large_market):
        market_size = 25
    elif any(s in combined for s in medium_market):
        market_size = 18
    else:
        market_size = 10

    # Tech commercial viability (up to 25 pts)
    commercial_tech = ["api", "cloud", "mobile app", "web app", "platform", "dashboard", "saas"]
    tech_score = min(25, sum(7 for t in commercial_tech if t in combined))

    # Problem severity / willingness to pay (up to 20 pts)
    pain_signals = ["critical", "expensive", "time-consuming", "manual", "error-prone",
                    "compliance", "regulation", "security", "efficiency"]
    pain_score = min(20, sum(6 for s in pain_signals if s in combined))

    total = int(min(100, market_score + market_size + tech_score + pain_score))
    return max(10, total)


def calculate_overall(scores: Dict[str, int]) -> int:
    """
    Calculate weighted overall recommendation score.

    Args:
        scores: Dict with keys matching SCORE_WEIGHTS

    Returns: 0-100
    """
    weighted_sum = 0
    total_weight = 0

    for dimension, weight in SCORE_WEIGHTS.items():
        if dimension in scores:
            weighted_sum += scores[dimension] * weight
            total_weight += weight

    # Completeness bonus (5 pts if all dimensions present)
    completeness_bonus = 5 if len(scores) >= 7 else 0

    if total_weight > 0:
        return int(min(100, (weighted_sum / total_weight) * (total_weight / sum(SCORE_WEIGHTS.values())) + completeness_bonus))
    return 50


def calculate_all_scores(
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
    similar_projects: List[Tuple[Dict, float]],
    team_members_skills: Optional[List[List[str]]] = None,
) -> Dict:
    """
    Calculate all 8 recommendation scores.

    Returns dict with all scores (0-100) and metadata.
    """
    domain_match = calculate_domain_match(project_domain, project_description, student_department, student_skills)
    uniqueness = calculate_uniqueness(similar_projects)
    innovation = calculate_innovation(uniqueness, project_description, tech_stack)
    impact, sdg_alignment = calculate_impact(project_description, target_audience, expected_impact, expected_users)
    feasibility = calculate_feasibility(tech_stack, team_size, duration, project_description)
    skill_match = calculate_skill_match(tech_stack, student_skills, team_members_skills)
    commercial = calculate_commercial_potential(project_description, target_audience, expected_users, project_domain)

    scores = {
        "domain_match": domain_match,
        "uniqueness": uniqueness,
        "innovation": innovation,
        "impact": impact,
        "feasibility": feasibility,
        "skill_match": skill_match,
        "commercial_potential": commercial,
    }

    scores["overall"] = calculate_overall(scores)

    return {
        "scores": scores,
        "sdg_alignment": sdg_alignment,
    }
