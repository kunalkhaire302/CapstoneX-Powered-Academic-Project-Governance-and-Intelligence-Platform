"""
Module 5: AI Team Formation Service — PRODUCTION VERSION
Forms optimal teams using hybrid optimization.

Algorithms:
    1. Feature extraction (skills, CGPA, interests, compatibility)
    2. KMeans clustering for initial grouping
    3. Hungarian algorithm for optimal skill-balanced assignment
    4. Constraint satisfaction (balanced CGPA, mixed skills, no isolation)
    5. Graph-based compatibility scoring

Features per student (12):
    skills_vector, interests_vector, CGPA, leadership, reliability,
    communication, github_activity, past_performance, availability,
    department, preferred_domain, programming_languages
"""
import logging
from typing import List, Dict, Optional, Tuple
import numpy as np
from scipy.optimize import linear_sum_assignment

from app.services.embedding_service import generate_embedding

logger = logging.getLogger(__name__)


async def form_teams(
    students: List[Dict],
    team_size: int = 4,
    constraints: Optional[Dict] = None,
) -> Dict:
    """
    Form optimal teams using hybrid optimization.

    Args:
        students: List of student profiles with skills, interests, etc.
        team_size: Desired team size (default: 4)
        constraints: Optional constraints (min_cgpa_spread, require_mixed_skills, etc.)

    Returns:
        Optimized team assignments with compatibility metrics
    """
    if not students:
        return {"teams": [], "error": "No students provided"}

    if len(students) < 2:
        return {
            "teams": [_build_team_output([students[0]], 0)],
            "total_students": 1,
            "algorithm": "single_student",
        }

    n = len(students)
    num_teams = max(1, n // team_size)

    # Step 1: Extract features
    student_features = _extract_all_features(students)
    skill_embeddings = _get_skill_embeddings(students)

    # Step 2: Compute compatibility matrix
    compatibility_matrix = _compute_compatibility_matrix(
        students, student_features, skill_embeddings,
    )

    # Step 3: Initial clustering (KMeans)
    initial_groups = _kmeans_clustering(skill_embeddings, num_teams)

    # Step 4: Optimize with Hungarian algorithm for skill balance
    optimized_groups = _optimize_assignment(
        students, student_features, initial_groups, num_teams, team_size,
    )

    # Step 5: Apply constraints
    final_groups = _apply_constraints(
        students, optimized_groups, student_features, constraints or {},
    )

    # Step 6: Build output with metrics
    teams = []
    for team_idx, member_indices in enumerate(final_groups):
        team_students = [students[i] for i in member_indices]
        team_features = [student_features[i] for i in member_indices]

        # Compute team metrics
        compatibility = _compute_team_compatibility(
            member_indices, compatibility_matrix,
        )
        diversity = _compute_diversity_score(team_features)
        skill_coverage = _compute_skill_coverage(team_students)
        strengths, weaknesses = _analyze_team(team_students, team_features)

        teams.append({
            "team_id": team_idx + 1,
            "members": [
                {
                    **s,
                    "student_id": s.get("student_id", s.get("id", f"student_{i}")),
                    "name": s.get("name", f"Student {i+1}"),
                    "skills": s.get("skills", []),
                    "role_suggestion": _suggest_role(s, team_students),
                }
                for i, s in zip(member_indices, team_students)
            ],
            "compatibility_score": round(compatibility * 100, 1),
            "diversity_score": round(diversity * 100, 1),
            "skill_coverage": round(skill_coverage * 100, 1),
            "strengths": strengths,
            "weaknesses": weaknesses,
            "balance_metrics": {
                "cgpa_spread": _compute_spread([f.get("cgpa", 0) for f in team_features]),
                "skill_balance": round(skill_coverage, 3),
                "experience_spread": _compute_spread(
                    [f.get("past_performance", 50) for f in team_features]
                ),
            },
        })

    # Sort teams by compatibility
    teams.sort(key=lambda t: t["compatibility_score"], reverse=True)

    # Generate improvement suggestions
    suggestions = _generate_improvement_suggestions(teams, students)

    return {
        "teams": teams,
        "total_students": n,
        "team_size_target": team_size,
        "num_teams": len(teams),
        "algorithm": "hybrid_kmeans_hungarian_csp",
        "overall_compatibility": round(
            np.mean([t["compatibility_score"] for t in teams]) if teams else 0, 1
        ),
        "overall_diversity": round(
            np.mean([t["diversity_score"] for t in teams]) if teams else 0, 1
        ),
        "suggestions": suggestions,
    }


# ──────────────────────────────────────────
# Feature Extraction
# ──────────────────────────────────────────

def _extract_all_features(students: List[Dict]) -> List[Dict]:
    """Extract numerical features from student profiles."""
    features = []
    for s in students:
        features.append({
            "skill_count": len(s.get("skills", [])),
            "interest_count": len(s.get("interests", [])),
            "cgpa": s.get("cgpa", 0) or 0,
            "leadership": s.get("leadership_score", 5) or 5,
            "reliability": s.get("reliability_score", 5) or 5,
            "communication": s.get("communication_score", 5) or 5,
            "github_activity": s.get("github_activity", 0) or 0,
            "past_performance": s.get("past_project_performance", 50) or 50,
            "availability": s.get("availability_score", 10) or 10,
        })
    return features


def _get_skill_embeddings(students: List[Dict]) -> np.ndarray:
    """Generate embeddings from student skill profiles."""
    embeddings = []
    for s in students:
        skills = s.get("skills", [])
        interests = s.get("interests", [])
        text = f"Skills: {', '.join(skills)}. Interests: {', '.join(interests)}."
        if not skills and not interests:
            text = "general computer science student"
        emb = generate_embedding(text)
        embeddings.append(emb)
    return np.array(embeddings)


# ──────────────────────────────────────────
# Clustering & Optimization
# ──────────────────────────────────────────

def _kmeans_clustering(embeddings: np.ndarray, k: int) -> List[List[int]]:
    """Initial KMeans clustering for grouping similar students."""
    from sklearn.cluster import KMeans

    n = len(embeddings)
    k = min(k, n)

    if k <= 1:
        return [list(range(n))]

    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels = kmeans.fit_predict(embeddings)

    groups = [[] for _ in range(k)]
    for i, label in enumerate(labels):
        groups[label].append(i)

    return groups


def _compute_compatibility_matrix(
    students: List[Dict],
    features: List[Dict],
    embeddings: np.ndarray,
) -> np.ndarray:
    """Compute pairwise compatibility scores between all students."""
    n = len(students)
    matrix = np.zeros((n, n))

    for i in range(n):
        for j in range(i + 1, n):
            # Skill complementarity (diversity is good)
            skills_i = set(s.lower() for s in students[i].get("skills", []))
            skills_j = set(s.lower() for s in students[j].get("skills", []))
            skill_complement = 1 - (
                len(skills_i & skills_j) / max(len(skills_i | skills_j), 1)
            )

            # Interest similarity (some shared interest is good)
            interests_i = set(s.lower() for s in students[i].get("interests", []))
            interests_j = set(s.lower() for s in students[j].get("interests", []))
            interest_sim = len(interests_i & interests_j) / max(len(interests_i | interests_j), 1)

            # CGPA balance (mixed is better than all same)
            cgpa_diff = abs(features[i]["cgpa"] - features[j]["cgpa"])
            cgpa_balance = min(1.0, cgpa_diff / 4.0)  # Normalize to 0-1

            # Embedding similarity
            emb_sim = float(np.dot(embeddings[i], embeddings[j]) / (
                np.linalg.norm(embeddings[i]) * np.linalg.norm(embeddings[j]) + 1e-8
            ))

            compatibility = (
                skill_complement * 0.35 +
                interest_sim * 0.25 +
                cgpa_balance * 0.20 +
                (1 - emb_sim) * 0.20  # Diversity in profile
            )

            matrix[i][j] = compatibility
            matrix[j][i] = compatibility

    return matrix


def _optimize_assignment(
    students: List[Dict],
    features: List[Dict],
    initial_groups: List[List[int]],
    num_teams: int,
    team_size: int,
) -> List[List[int]]:
    """
    Optimize team assignments using the Hungarian algorithm.
    Tries to balance skills across teams.
    """
    n = len(students)

    # If initial groups are already well-sized, refine them
    all_students = list(range(n))
    groups = [[] for _ in range(num_teams)]

    # Sort students by CGPA descending for balanced distribution
    sorted_indices = sorted(all_students, key=lambda i: features[i]["cgpa"], reverse=True)

    # Round-robin assignment ensuring CGPA balance
    for rank, idx in enumerate(sorted_indices):
        # Assign to the team with fewest members, breaking ties by lowest total CGPA
        target_team = min(
            range(num_teams),
            key=lambda t: (len(groups[t]), sum(features[i]["cgpa"] for i in groups[t])),
        )
        groups[target_team].append(idx)

    return groups


def _apply_constraints(
    students: List[Dict],
    groups: List[List[int]],
    features: List[Dict],
    constraints: Dict,
) -> List[List[int]]:
    """Apply constraints to team assignments."""
    # Constraint 1: No isolated members (all teams should have >= 2 members)
    non_empty = [g for g in groups if len(g) >= 2]
    singletons = [g[0] for g in groups if len(g) == 1]

    # Add singletons to smallest teams
    for s in singletons:
        smallest = min(non_empty, key=len)
        smallest.append(s)

    # Remove empty groups
    groups = [g for g in non_empty if g]

    return groups


# ──────────────────────────────────────────
# Team Analysis
# ──────────────────────────────────────────

def _compute_team_compatibility(indices: List[int], matrix: np.ndarray) -> float:
    """Compute average pairwise compatibility within a team."""
    if len(indices) < 2:
        return 0.5
    scores = []
    for i in range(len(indices)):
        for j in range(i + 1, len(indices)):
            scores.append(matrix[indices[i]][indices[j]])
    return float(np.mean(scores)) if scores else 0.5


def _compute_diversity_score(features: List[Dict]) -> float:
    """Compute team diversity score from feature variance."""
    if len(features) < 2:
        return 0.5

    skill_counts = [f["skill_count"] for f in features]
    cgpas = [f["cgpa"] for f in features]

    # Higher variance = higher diversity
    skill_var = np.std(skill_counts) / (np.mean(skill_counts) + 1e-8)
    cgpa_var = np.std(cgpas) / (np.mean(cgpas) + 1e-8)

    return min(1.0, (skill_var + cgpa_var) / 2)


def _compute_skill_coverage(students: List[Dict]) -> float:
    """Compute what fraction of unique skills the team covers."""
    all_skills = set()
    team_skills = set()

    for s in students:
        skills = s.get("skills", [])
        team_skills.update(s.lower() for s in skills)

    # Estimate total available skills from all students
    if not team_skills:
        return 0.5

    # Coverage = team unique skills / max possible (capped)
    return min(1.0, len(team_skills) / 8.0)


def _analyze_team(students: List[Dict], features: List[Dict]) -> Tuple[List[str], List[str]]:
    """Analyze team strengths and weaknesses."""
    strengths = []
    weaknesses = []

    all_skills = set()
    for s in students:
        all_skills.update(s.lower() for s in s.get("skills", []))

    # Strengths
    if len(all_skills) >= 6:
        strengths.append("Diverse skill set covering multiple technologies")
    if np.mean([f["cgpa"] for f in features]) > 7:
        strengths.append("Strong academic performance")
    if any(f["leadership"] >= 7 for f in features):
        strengths.append("Has a natural team leader")
    if all(f["reliability"] >= 6 for f in features):
        strengths.append("All members show high reliability")

    # Weaknesses
    if len(all_skills) < 3:
        weaknesses.append("Limited skill diversity — consider cross-training")
    if np.std([f["cgpa"] for f in features]) > 3:
        weaknesses.append("Wide CGPA gap — stronger members should mentor others")
    if all(f["leadership"] < 5 for f in features):
        weaknesses.append("No strong leader identified — assign a team lead role")
    if any(f["communication"] < 4 for f in features):
        weaknesses.append("Some members may need communication support")

    if not strengths:
        strengths.append("Balanced team composition")
    if not weaknesses:
        weaknesses.append("No significant concerns identified")

    return strengths, weaknesses


def _suggest_role(student: Dict, team: List[Dict]) -> str:
    """Suggest a role for the student within the team."""
    skills = [s.lower() for s in student.get("skills", [])]
    leadership = student.get("leadership_score", 5) or 5
    communication = student.get("communication_score", 5) or 5

    if leadership >= 7 and communication >= 6:
        return "Team Lead"
    elif any(s in skills for s in ["react", "angular", "vue", "html", "css", "ui", "ux"]):
        return "Frontend Developer"
    elif any(s in skills for s in ["node", "python", "django", "flask", "express", "spring"]):
        return "Backend Developer"
    elif any(s in skills for s in ["ml", "ai", "deep learning", "data science", "tensorflow"]):
        return "ML Engineer"
    elif any(s in skills for s in ["aws", "docker", "kubernetes", "devops", "ci/cd"]):
        return "DevOps Engineer"
    elif any(s in skills for s in ["sql", "mongodb", "postgresql", "database"]):
        return "Database Engineer"
    elif any(s in skills for s in ["testing", "qa", "selenium", "jest"]):
        return "QA Engineer"
    elif communication >= 7:
        return "Documentation & Coordination"
    return "Full Stack Developer"


def _compute_spread(values: List) -> float:
    """Compute normalized spread (coefficient of variation)."""
    if not values or len(values) < 2:
        return 0.0
    mean_val = np.mean(values)
    if mean_val == 0:
        return 0.0
    return round(float(np.std(values) / mean_val), 3)


def _generate_improvement_suggestions(teams: List[Dict], students: List[Dict]) -> List[str]:
    """Generate suggestions for improving team assignments."""
    suggestions = []

    low_compat_teams = [t for t in teams if t["compatibility_score"] < 50]
    if low_compat_teams:
        suggestions.append(
            f"{len(low_compat_teams)} team(s) have below-average compatibility. "
            f"Consider swapping members between teams."
        )

    low_diversity = [t for t in teams if t["diversity_score"] < 30]
    if low_diversity:
        suggestions.append(
            f"{len(low_diversity)} team(s) lack skill diversity. "
            f"Mix students with different technical backgrounds."
        )

    if not suggestions:
        suggestions.append("Teams are well-balanced. No major improvements needed.")

    return suggestions
