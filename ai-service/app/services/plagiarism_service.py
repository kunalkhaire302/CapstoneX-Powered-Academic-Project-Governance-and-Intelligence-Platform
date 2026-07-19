"""
Module 7: Plagiarism Detection Service
Uses sentence-level embeddings + cosine similarity for detecting
content overlap between project documents.

Pipeline:
    1. Preprocess text → clean, sentence-split
    2. Generate sentence-level embeddings
    3. Compare against all indexed projects in FAISS
    4. Paragraph-level matching for detailed highlighting
    5. Generate report with matched sections and risk level
"""
import logging
import re
from typing import List, Dict, Tuple
import numpy as np

from app.services.embedding_service import generate_embedding
from app.services.vector_store import search_similar, get_total_projects

logger = logging.getLogger(__name__)


# ──────────────────────────────────────────
# Text Preprocessing
# ──────────────────────────────────────────

def _preprocess_text(text: str) -> str:
    """Clean and normalize text."""
    text = re.sub(r'\s+', ' ', text.strip())
    text = re.sub(r'[^\w\s.,!?;:\-()]', '', text)
    return text


def _split_sentences(text: str) -> List[str]:
    """Split text into sentences."""
    sentences = re.split(r'(?<=[.!?])\s+', text)
    return [s.strip() for s in sentences if len(s.strip()) > 20]


def _split_paragraphs(text: str) -> List[str]:
    """Split text into paragraphs."""
    paragraphs = re.split(r'\n\s*\n|\n{2,}', text)
    # Also split long blocks by sentence count
    result = []
    for p in paragraphs:
        p = p.strip()
        if len(p) > 500:
            sentences = _split_sentences(p)
            # Group into chunks of 3-4 sentences
            for i in range(0, len(sentences), 3):
                chunk = " ".join(sentences[i:i+3])
                if len(chunk) > 30:
                    result.append(chunk)
        elif len(p) > 30:
            result.append(p)
    return result


# ──────────────────────────────────────────
# Similarity Computation
# ──────────────────────────────────────────

def _cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """Compute cosine similarity between two vectors."""
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(a, b) / (norm_a * norm_b))


def _batch_cosine_similarity(query: np.ndarray, corpus: np.ndarray) -> np.ndarray:
    """Compute cosine similarity between a query and a corpus of vectors."""
    if corpus.size == 0:
        return np.array([])
    norms = np.linalg.norm(corpus, axis=1)
    norms[norms == 0] = 1  # Avoid division by zero
    query_norm = np.linalg.norm(query)
    if query_norm == 0:
        return np.zeros(len(corpus))
    return np.dot(corpus, query) / (norms * query_norm)


# ──────────────────────────────────────────
# Main Plagiarism Check
# ──────────────────────────────────────────

async def check_plagiarism(
    text: str,
    document_type: str = "problem_statement",
    threshold: float = 0.75,
    exclude_project_id: str = None,
) -> Dict:
    """
    Run full plagiarism analysis on the provided text.

    Args:
        text: Document text to check
        document_type: Type of document being checked
        threshold: Similarity threshold for flagging (0-1)
        exclude_project_id: Project ID to exclude from matches (self)

    Returns:
        Plagiarism report with similarity percentage, matched sections, and risk level
    """
    if not text or len(text.strip()) < 50:
        return {
            "overall_similarity": 0,
            "risk_level": "none",
            "matched_projects": [],
            "highlighted_sections": [],
            "recommendations": ["Document too short for meaningful analysis."],
            "analysis_details": {"paragraphs_analyzed": 0, "projects_compared": 0},
        }

    cleaned_text = _preprocess_text(text)
    paragraphs = _split_paragraphs(cleaned_text)

    if not paragraphs:
        return {
            "overall_similarity": 0,
            "risk_level": "none",
            "matched_projects": [],
            "highlighted_sections": [],
            "recommendations": [],
            "analysis_details": {"paragraphs_analyzed": 0, "projects_compared": 0},
        }

    total_projects = get_total_projects()

    # Generate embeddings for each paragraph
    paragraph_embeddings = []
    for para in paragraphs:
        emb = generate_embedding(para)
        paragraph_embeddings.append(emb)

    # Search for similar content per paragraph
    matched_projects = {}
    highlighted_sections = []
    paragraph_max_similarities = []

    for i, (para, emb) in enumerate(zip(paragraphs, paragraph_embeddings)):
        # Search FAISS for similar projects
        similar = search_similar(emb, top_k=5)

        max_sim = 0.0
        for project, sim_pct in similar:
            project_id = project.get("id", "")

            if project_id == exclude_project_id:
                continue

            sim_score = sim_pct / 100.0

            if sim_score >= threshold:
                # Found a match
                if project_id not in matched_projects:
                    matched_projects[project_id] = {
                        "project_id": project_id,
                        "title": project.get("title", "Unknown"),
                        "domain": project.get("domain", ""),
                        "max_similarity": 0,
                        "matched_sections": 0,
                        "source": project.get("source", ""),
                    }

                matched_projects[project_id]["matched_sections"] += 1
                matched_projects[project_id]["max_similarity"] = max(
                    matched_projects[project_id]["max_similarity"], sim_score,
                )

                highlighted_sections.append({
                    "paragraph_index": i,
                    "text": para[:200] + ("..." if len(para) > 200 else ""),
                    "similarity": round(sim_score * 100, 1),
                    "matched_project_id": project_id,
                    "matched_project_title": project.get("title", "Unknown"),
                })

            max_sim = max(max_sim, sim_score)

        paragraph_max_similarities.append(max_sim)

    # Calculate overall similarity
    if paragraph_max_similarities:
        # Weighted: high-similarity paragraphs count more
        weights = np.array(paragraph_max_similarities)
        overall_similarity = float(np.mean(weights)) * 100
    else:
        overall_similarity = 0

    # Determine risk level
    risk_level = _determine_risk_level(overall_similarity, len(highlighted_sections), len(paragraphs))

    # Generate recommendations
    recommendations = _generate_plagiarism_recommendations(
        risk_level, overall_similarity, highlighted_sections, matched_projects,
    )

    # Sort matched projects by similarity
    matched_list = sorted(
        matched_projects.values(),
        key=lambda x: x["max_similarity"],
        reverse=True,
    )

    # Format similarity percentages
    for m in matched_list:
        m["max_similarity"] = round(m["max_similarity"] * 100, 1)

    return {
        "overall_similarity": round(overall_similarity, 1),
        "risk_level": risk_level,
        "matched_projects": matched_list[:10],
        "highlighted_sections": highlighted_sections[:20],
        "recommendations": recommendations,
        "analysis_details": {
            "paragraphs_analyzed": len(paragraphs),
            "projects_compared": total_projects,
            "threshold_used": threshold,
            "sections_flagged": len(highlighted_sections),
        },
    }


async def quick_check(text: str) -> Dict:
    """
    Fast sentence-level check for quick plagiarism assessment.
    Returns a simple similarity percentage without detailed matching.
    """
    if not text or len(text.strip()) < 30:
        return {"similarity": 0, "risk_level": "none"}

    emb = generate_embedding(text[:1000])  # Limit for speed
    results = search_similar(emb, top_k=3)

    if not results:
        return {"similarity": 0, "risk_level": "none"}

    max_sim = max(sim for _, sim in results)
    risk = "none"
    if max_sim > 85:
        risk = "critical"
    elif max_sim > 70:
        risk = "high"
    elif max_sim > 50:
        risk = "medium"
    elif max_sim > 30:
        risk = "low"

    return {
        "similarity": round(max_sim, 1),
        "risk_level": risk,
        "top_match": results[0][0].get("title", "Unknown") if results else None,
    }


def _determine_risk_level(overall_sim: float, flagged_count: int, total_paragraphs: int) -> str:
    """Determine plagiarism risk level."""
    flagged_ratio = flagged_count / max(total_paragraphs, 1)

    if overall_sim > 80 or flagged_ratio > 0.7:
        return "critical"
    elif overall_sim > 60 or flagged_ratio > 0.5:
        return "high"
    elif overall_sim > 40 or flagged_ratio > 0.3:
        return "medium"
    elif overall_sim > 20 or flagged_ratio > 0.1:
        return "low"
    return "none"


def _generate_plagiarism_recommendations(
    risk_level: str,
    overall_sim: float,
    highlighted: List[Dict],
    matched_projects: Dict,
) -> List[str]:
    """Generate actionable recommendations based on plagiarism analysis."""
    recs = []

    if risk_level == "critical":
        recs.append("🚨 Very high similarity detected. This document requires immediate revision.")
        recs.append("Rewrite flagged sections in your own words with original analysis.")
    elif risk_level == "high":
        recs.append("⚠️ Significant overlap found with existing projects.")
        recs.append("Rephrase highlighted sections and add original contributions.")
    elif risk_level == "medium":
        recs.append("Some similarities detected. Review highlighted sections.")
        recs.append("Ensure proper citations where external ideas are referenced.")
    elif risk_level == "low":
        recs.append("Minor similarities detected — likely common domain terminology.")

    if matched_projects:
        top_matches = sorted(
            matched_projects.values(),
            key=lambda x: x.get("max_similarity", 0),
            reverse=True,
        )[:3]
        for m in top_matches:
            title = m.get("title", "Unknown")
            sim = m.get("max_similarity", 0)
            if isinstance(sim, float) and sim < 1:
                sim *= 100
            recs.append(f"Review overlap with: '{title}' ({sim:.0f}% similarity)")

    if risk_level in ("none", "low"):
        recs.append("✅ Document appears to be original work.")

    return recs
