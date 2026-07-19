"""
Feedback Analysis Service
Uses NLP and LLMs to analyze mentor feedback, extract sentiment, and identify action items.
"""
import logging
from typing import Dict, List, Optional
import re

from app.services.llm_service import generate_structured_response

logger = logging.getLogger(__name__)


async def analyze_feedback(text: str) -> Dict:
    """
    Analyze mentor feedback text to extract sentiment, key points, and action items.

    Args:
        text: The feedback text from mentor

    Returns:
        Dict with analysis results
    """
    if not text or len(text.strip()) < 10:
        return {
            "sentiment": "neutral",
            "sentiment_score": 50,
            "key_points": [],
            "action_items": [],
            "tone": "neutral",
            "is_constructive": True,
        }

    # Prompt for the LLM
    prompt = f"""
    Analyze the following feedback provided by a mentor to a student project group.
    Extract the sentiment, key discussion points, and specific action items or tasks assigned.
    Also assess the tone and whether the feedback is constructive.

    Feedback text:
    "{text}"
    """

    schema = {
        "type": "object",
        "properties": {
            "sentiment": {
                "type": "string",
                "enum": ["positive", "neutral", "negative", "mixed"]
            },
            "sentiment_score": {
                "type": "integer",
                "description": "Score from 0 (very negative) to 100 (very positive)"
            },
            "key_points": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Main observations or points discussed"
            },
            "action_items": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Specific tasks, corrections, or next steps the students must take"
            },
            "tone": {
                "type": "string",
                "description": "E.g., encouraging, critical, professional, urgent"
            },
            "is_constructive": {
                "type": "boolean"
            }
        },
        "required": ["sentiment", "sentiment_score", "key_points", "action_items", "tone", "is_constructive"]
    }

    try:
        result = await generate_structured_response(prompt, schema)
        if result:
            return result
    except Exception as e:
        logger.error(f"LLM feedback analysis failed: {e}")

    # Fallback heuristic analysis if LLM fails
    return _heuristic_feedback_analysis(text)


def _heuristic_feedback_analysis(text: str) -> Dict:
    """Fallback heuristic analysis when LLM is unavailable."""
    text_lower = text.lower()
    
    # Simple sentiment scoring
    positive_words = ["good", "great", "excellent", "well done", "progress", "improving", "solid", "approved"]
    negative_words = ["poor", "bad", "delay", "behind", "fail", "missing", "incomplete", "issue", "problem"]
    
    pos_count = sum(1 for w in positive_words if w in text_lower)
    neg_count = sum(1 for w in negative_words if w in text_lower)
    
    score = 50 + (pos_count * 10) - (neg_count * 10)
    score = max(0, min(100, score))
    
    if score >= 70:
        sentiment = "positive"
    elif score <= 30:
        sentiment = "negative"
    elif pos_count > 0 and neg_count > 0:
        sentiment = "mixed"
    else:
        sentiment = "neutral"

    # Simple action item extraction (sentences with "need", "must", "should", "fix", "update")
    sentences = [s.strip() for s in re.split(r'[.!?]+', text) if s.strip()]
    action_items = []
    key_points = []
    
    action_keywords = ["need to", "must", "should", "please fix", "update", "correct", "ensure"]
    
    for s in sentences:
        s_lower = s.lower()
        is_action = any(k in s_lower for k in action_keywords)
        if is_action:
            action_items.append(s)
        else:
            if len(s) > 20:  # Only substantial sentences
                key_points.append(s)

    return {
        "sentiment": sentiment,
        "sentiment_score": score,
        "key_points": key_points[:3],
        "action_items": action_items,
        "tone": "professional",
        "is_constructive": True,
        "analysis_method": "heuristic_fallback"
    }
