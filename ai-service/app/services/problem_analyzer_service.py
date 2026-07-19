"""
Problem Statement Analyzer — 12-Step Recommendation Pipeline Orchestrator.

This is the main entry point that ties together all recommendation services:
1. analyze_domain()          → Match project against domain taxonomy
2. extract_keywords()        → TF-IDF keyword extraction from description
3. generate_embeddings()     → Create semantic embedding of project
4. find_similar_projects()   → Query FAISS for similar previous projects
5. calculate_similarity()    → Compute cosine similarity percentages
6. calculate_uniqueness()    → Inverse of max similarity
7. match_skills()            → Compare required tech vs team skills
8. estimate_feasibility()    → Score based on duration, team, complexity
9. evaluate_innovation()     → Uniqueness + trends + novelty
10. evaluate_impact()        → SDG alignment + audience + depth
11. generate_ai_suggestions() → LLM-powered suggestions
12. compile_report()         → Aggregate into final recommendation report

Concepts from amitkaps/recommendation applied:
- Content-based filtering via embeddings
- Hybrid scoring (embedding + heuristic)
- Feature engineering from structured + unstructured data
"""
import logging
from typing import Dict, List, Optional
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

from app.services.embedding_service import generate_embedding, combine_text_for_embedding
from app.services.vector_store import search_similar, get_total_projects
from app.services.scoring_engine import calculate_all_scores
from app.services.llm_service import generate_ai_suggestions

logger = logging.getLogger(__name__)


async def analyze_problem_statement(
    title: str,
    problem_statement: str,
    description: str,
    domain: str,
    department: str,
    skills: List[str],
    tech_stack: List[str],
    team_members: Optional[List[Dict]] = None,
    hackathon_theme: str = "",
    expected_users: str = "",
    target_audience: str = "",
    expected_impact: str = "",
    duration: str = "",
) -> Dict:
    """
    Execute the full 12-step recommendation pipeline.

    Args:
        title: Project title
        problem_statement: Core problem being solved
        description: Detailed project description
        domain: Project domain (e.g., "Machine Learning", "Web Development")
        department: Student's academic department
        skills: Student's listed skills
        tech_stack: Technologies planned for the project
        team_members: Optional list of team member dicts with skills
        hackathon_theme: Theme/track of the hackathon
        expected_users: Who will use the product
        target_audience: Target audience description
        expected_impact: Expected real-world impact
        duration: Project/hackathon duration

    Returns:
        Complete recommendation report dictionary
    """
    logger.info(f"🔍 Starting 12-step analysis for: {title}")

    # ──────────────────────────────────────────
    # Step 1: Analyze Domain
    # ──────────────────────────────────────────
    logger.info("Step 1/12: Analyzing domain...")
    domain_analysis = _analyze_domain(domain, description, skills)

    # ──────────────────────────────────────────
    # Step 2: Extract Keywords
    # ──────────────────────────────────────────
    logger.info("Step 2/12: Extracting keywords...")
    keywords = _extract_keywords(f"{title} {problem_statement} {description}")

    # ──────────────────────────────────────────
    # Step 3: Generate Embeddings
    # ──────────────────────────────────────────
    logger.info("Step 3/12: Generating semantic embeddings...")
    combined_text = combine_text_for_embedding(
        title=title,
        problem_statement=problem_statement,
        description=description,
        domain=domain,
        tech_stack=tech_stack,
        hackathon_theme=hackathon_theme,
        expected_impact=expected_impact,
    )
    embedding = generate_embedding(combined_text)

    # ──────────────────────────────────────────
    # Steps 4-5: Find Similar Projects + Calculate Similarity
    # ──────────────────────────────────────────
    logger.info("Steps 4-5/12: Finding similar projects...")
    similar_projects_raw = search_similar(embedding, top_k=10)

    similar_projects = []
    for project, similarity_pct in similar_projects_raw:
        reason = _generate_similarity_reason(
            project.get("title", ""),
            project.get("domain", ""),
            project.get("tech_stack", []),
            domain,
            tech_stack,
            similarity_pct,
        )
        similar_projects.append({
            "id": project.get("id", ""),
            "title": project.get("title", "Unknown"),
            "domain": project.get("domain", ""),
            "similarity": similarity_pct,
            "reason": reason,
        })

    # ──────────────────────────────────────────
    # Steps 6-10: Calculate All Scores
    # ──────────────────────────────────────────
    logger.info("Steps 6-10/12: Calculating scores...")
    team_size = len(team_members) if team_members else 1
    team_skills = []
    if team_members:
        team_skills = [m.get("skills", []) for m in team_members if isinstance(m, dict)]

    scoring_result = calculate_all_scores(
        project_description=f"{problem_statement} {description}",
        project_domain=domain,
        student_department=department,
        student_skills=skills,
        tech_stack=tech_stack,
        target_audience=target_audience,
        expected_impact=expected_impact,
        expected_users=expected_users,
        duration=duration,
        team_size=team_size,
        similar_projects=[(p, p["similarity"]) for p in similar_projects],
        team_members_skills=team_skills if team_skills else None,
    )

    scores = scoring_result["scores"]
    sdg_alignment = scoring_result["sdg_alignment"]

    # ──────────────────────────────────────────
    # Step 11: Generate AI Suggestions
    # ──────────────────────────────────────────
    logger.info("Step 11/12: Generating AI suggestions...")
    ai_suggestions = await generate_ai_suggestions(
        title=title,
        problem_statement=problem_statement,
        description=description,
        domain=domain,
        tech_stack=tech_stack,
        target_audience=target_audience,
        expected_impact=expected_impact,
        scores=scores,
        similar_projects=similar_projects[:5],
    )

    # ──────────────────────────────────────────
    # Step 12: Compile Report
    # ──────────────────────────────────────────
    logger.info("Step 12/12: Compiling recommendation report...")

    # High similarity warning
    warnings = []
    if similar_projects and similar_projects[0]["similarity"] > 90:
        warnings.append({
            "type": "high_similarity",
            "message": f"Your idea is {similar_projects[0]['similarity']}% similar to '{similar_projects[0]['title']}'. Consider differentiating your approach.",
            "severity": "critical",
        })
    elif similar_projects and similar_projects[0]["similarity"] > 75:
        warnings.append({
            "type": "moderate_similarity",
            "message": f"Your idea shows {similar_projects[0]['similarity']}% similarity to existing projects. Adding unique features is recommended.",
            "severity": "warning",
        })

    report = {
        "scores": scores,
        "similar_projects": similar_projects,
        "ai_suggestions": ai_suggestions,
        "sdg_alignment": sdg_alignment,
        "keywords": keywords,
        "domain_analysis": domain_analysis,
        "warnings": warnings,
        "total_projects_compared": get_total_projects(),
        "model_version": "2.0-hybrid-embedding",
    }

    logger.info(f"✅ Analysis complete. Overall score: {scores.get('overall', 0)}/100")
    return report


def _analyze_domain(domain: str, description: str, skills: List[str]) -> Dict:
    """Step 1: Identify primary and secondary domains."""
    from app.services.scoring_engine import DOMAIN_TAXONOMY

    combined = f"{domain} {description} {' '.join(skills)}".lower()
    domain_scores = {}

    for dom, keywords in DOMAIN_TAXONOMY.items():
        match_count = sum(1 for kw in keywords if kw in combined)
        if match_count > 0:
            domain_scores[dom] = round(match_count / len(keywords) * 100, 1)

    # Sort by score
    sorted_domains = sorted(domain_scores.items(), key=lambda x: x[1], reverse=True)

    return {
        "primary_domain": sorted_domains[0][0] if sorted_domains else domain or "General",
        "secondary_domains": [d[0] for d in sorted_domains[1:3]],
        "domain_confidence": sorted_domains[0][1] if sorted_domains else 0,
        "all_domains": dict(sorted_domains[:5]),
    }


def _extract_keywords(text: str) -> List[str]:
    """Step 2: Extract top keywords using TF-IDF."""
    if not text or not text.strip():
        return []

    try:
        vectorizer = TfidfVectorizer(
            stop_words="english",
            max_features=20,
            ngram_range=(1, 2),
        )
        tfidf_matrix = vectorizer.fit_transform([text])
        feature_names = vectorizer.get_feature_names_out()
        scores = tfidf_matrix.toarray()[0]

        # Sort by TF-IDF score
        keyword_scores = list(zip(feature_names, scores))
        keyword_scores.sort(key=lambda x: x[1], reverse=True)

        return [kw for kw, score in keyword_scores[:15] if score > 0]
    except Exception as e:
        logger.warning(f"Keyword extraction failed: {e}")
        # Fallback: simple word frequency
        words = text.lower().split()
        return list(set(w for w in words if len(w) > 3))[:15]


def _generate_similarity_reason(
    similar_title: str,
    similar_domain: str,
    similar_tech: List[str],
    project_domain: str,
    project_tech: List[str],
    similarity_pct: float,
) -> str:
    """Generate a human-readable reason for similarity."""
    reasons = []

    # Domain overlap
    if similar_domain and project_domain:
        if similar_domain.lower() == project_domain.lower():
            reasons.append(f"Same domain ({similar_domain})")
        elif any(w in similar_domain.lower() for w in project_domain.lower().split()):
            reasons.append(f"Related domain ({similar_domain})")

    # Tech stack overlap
    if similar_tech and project_tech:
        overlap = set(t.lower() for t in similar_tech) & set(t.lower() for t in project_tech)
        if overlap:
            reasons.append(f"Shared technologies: {', '.join(list(overlap)[:3])}")

    # Similarity level context
    if similarity_pct > 90:
        reasons.append("Very similar problem scope and approach")
    elif similarity_pct > 75:
        reasons.append("Similar problem space with overlapping features")
    elif similarity_pct > 50:
        reasons.append("Related concept with some shared ideas")
    else:
        reasons.append("Loosely related in scope")

    return ". ".join(reasons) + "."


async def improve_problem_statement(
    title: str,
    problem_statement: str,
    description: str,
    domain: str,
    tech_stack: List[str],
    scores: Dict[str, int],
    similar_projects: List[Dict],
) -> Dict:
    """
    Generate improvement-focused suggestions without full re-analysis.
    Used when user clicks "Improve Idea".
    """
    suggestions = await generate_ai_suggestions(
        title=title,
        problem_statement=problem_statement,
        description=description,
        domain=domain,
        tech_stack=tech_stack,
        target_audience="",
        expected_impact="",
        scores=scores,
        similar_projects=similar_projects,
    )

    # Focus on actionable improvements
    return {
        "improvement_suggestions": suggestions.get("improvement_suggestions", []),
        "missing_features": suggestions.get("missing_features", []),
        "tech_recommendations": suggestions.get("tech_recommendations", []),
        "recommended_frameworks": suggestions.get("recommended_frameworks", []),
        "risks": suggestions.get("risks", []),
    }
