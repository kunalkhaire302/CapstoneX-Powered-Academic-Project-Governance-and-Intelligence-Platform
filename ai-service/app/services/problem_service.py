"""
Problem Statement Analyzer Service
Analyzes submitted project ideas for feasibility, innovation, scope, and clarity.
Uses NLP + LLM (with heuristic fallback).
"""
import logging
from typing import Dict, List
import re

from app.services.llm_service import generate_structured_response
from app.ml.feature_engineering import COMPLEX_TECH, TRENDING_TECH

logger = logging.getLogger(__name__)


async def analyze_problem_statement(
    title: str,
    description: str,
    tech_stack: List[str],
    domain: str = ""
) -> Dict:
    """
    Analyze a project problem statement across 5 dimensions:
    feasibility, innovation, scope, clarity, and tech stack relevance.
    """
    full_text = f"Title: {title}\nDomain: {domain}\nTech Stack: {', '.join(tech_stack)}\n\nDescription: {description}"
    
    if len(description.strip()) < 50:
        return _fallback_analysis(title, description, tech_stack, domain, 
                                 "Description is too short for deep analysis.")

    # LLM Prompt
    prompt = f"""
    Analyze the following university capstone project proposal.
    Score the project on a scale of 1-10 for each of the following metrics:
    - feasibility: Can students build this in 1-2 semesters?
    - innovation: Is this novel, or a generic CRUD app?
    - scope: Is the scope appropriate (not too small, not too large)?
    - clarity: Is the problem and solution well-defined?
    
    Also provide a brief overall assessment, identify technical risks, and suggest improvements.
    
    Project Proposal:
    {full_text}
    """

    schema = {
        "type": "object",
        "properties": {
            "scores": {
                "type": "object",
                "properties": {
                    "feasibility": {"type": "integer", "minimum": 1, "maximum": 10},
                    "innovation": {"type": "integer", "minimum": 1, "maximum": 10},
                    "scope": {"type": "integer", "minimum": 1, "maximum": 10},
                    "clarity": {"type": "integer", "minimum": 1, "maximum": 10},
                },
                "required": ["feasibility", "innovation", "scope", "clarity"]
            },
            "overall_assessment": {"type": "string"},
            "technical_risks": {
                "type": "array",
                "items": {"type": "string"}
            },
            "suggestions": {
                "type": "array",
                "items": {"type": "string"}
            }
        },
        "required": ["scores", "overall_assessment", "technical_risks", "suggestions"]
    }

    try:
        result = await generate_structured_response(prompt, schema)
        if result:
            # Add calculated metrics
            result["metrics"] = _calculate_nlp_metrics(description, tech_stack)
            
            # Compute average score
            scores = result["scores"]
            result["overall_score"] = sum(scores.values()) / len(scores)
            
            return result
    except Exception as e:
        logger.error(f"LLM problem analysis failed: {e}")

    # Fallback heuristic analysis
    return _fallback_analysis(title, description, tech_stack, domain)


def _calculate_nlp_metrics(description: str, tech_stack: List[str]) -> Dict:
    """Calculate basic NLP metrics from the text."""
    desc_lower = description.lower()
    sentences = [s for s in re.split(r'[.!?]+', description) if s.strip()]
    
    tech_lower = [t.lower() for t in tech_stack]
    
    complex_count = sum(1 for t in COMPLEX_TECH if t in desc_lower or t in tech_lower)
    trend_count = sum(1 for t in TRENDING_TECH if t in desc_lower or t in tech_lower)
    
    return {
        "word_count": len(desc_lower.split()),
        "sentence_count": len(sentences),
        "complexity_signals": complex_count,
        "trending_signals": trend_count,
    }


def _fallback_analysis(
    title: str, 
    description: str, 
    tech_stack: List[str], 
    domain: str,
    reason: str = None
) -> Dict:
    """Fallback analysis when LLM is unavailable."""
    metrics = _calculate_nlp_metrics(description, tech_stack)
    
    # Heuristic scoring
    word_count = metrics["word_count"]
    complex_signals = metrics["complexity_signals"]
    trend_signals = metrics["trending_signals"]
    
    # Clarity: based on length and structure
    clarity = min(10, max(2, (word_count / 30) + 2))
    if word_count > 300: clarity -= 1  # Too long
    
    # Innovation: based on trending/complex tech
    innovation = min(10, max(3, 4 + trend_signals + (complex_signals * 0.5)))
    
    # Scope: assuming average scope, penalized if too short or too many complex techs
    scope = 7
    if complex_signals > 3: scope = 9  # Large scope
    if word_count < 40: scope = 3      # Small scope
    
    # Feasibility: Inverse of extreme scope/complexity
    feasibility = 8
    if complex_signals >= 4: feasibility = 4  # Too complex
    if len(tech_stack) > 8: feasibility = 5   # Too many technologies
    
    scores = {
        "feasibility": round(feasibility),
        "innovation": round(innovation),
        "scope": round(scope),
        "clarity": round(clarity),
    }
    
    overall_score = sum(scores.values()) / len(scores)
    
    risks = []
    if complex_signals > 3:
        risks.append("High technical complexity may cause delays.")
    if len(tech_stack) > 7:
        risks.append("Very large technology stack proposed. Integration risks.")
    if not tech_stack:
        risks.append("No technology stack specified.")
        
    suggestions = []
    if word_count < 100:
        suggestions.append("Expand the description to clearly define the problem and proposed solution.")
    if innovation < 5:
        suggestions.append("Consider adding unique features or modern technologies to increase project value.")
        
    if not risks:
        risks.append("Standard project risks apply.")
    if not suggestions:
        suggestions.append("Project definition looks solid.")

    return {
        "scores": scores,
        "overall_score": overall_score,
        "overall_assessment": reason or "Standard heuristic assessment applied due to LLM unavailability.",
        "technical_risks": risks,
        "suggestions": suggestions,
        "metrics": metrics,
        "analysis_method": "heuristic_fallback"
    }
