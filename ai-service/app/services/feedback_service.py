"""
Module 3: AI Evaluation Feedback Generator
Uses template-based generation with optional HuggingFace transformer fallback.
"""
import logging
import os

logger = logging.getLogger(__name__)

feedback_model = None
feedback_tokenizer = None
USE_TRANSFORMER = os.getenv("USE_TRANSFORMER_FEEDBACK", "false").lower() == "true"


def load_feedback_model():
    """Load the feedback generation model (transformer or template-based)."""
    global feedback_model, feedback_tokenizer
    if USE_TRANSFORMER:
        try:
            from transformers import T5ForConditionalGeneration, T5Tokenizer
            model_name = os.getenv("FEEDBACK_MODEL", "google/flan-t5-small")
            logger.info(f"Loading transformer model: {model_name}")
            feedback_tokenizer = T5Tokenizer.from_pretrained(model_name)
            feedback_model = T5ForConditionalGeneration.from_pretrained(model_name)
            logger.info("✅ Feedback transformer model loaded")
        except Exception as e:
            logger.warning(f"⚠️  Transformer load failed ({e}), using template-based feedback")
            feedback_model = None
    else:
        logger.info("✅ Using template-based feedback generation")


def _generate_with_transformer(prompt: str) -> str:
    """Generate feedback using flan-t5 model."""
    inputs = feedback_tokenizer(prompt, return_tensors="pt", max_length=512, truncation=True)
    outputs = feedback_model.generate(
        inputs.input_ids,
        max_new_tokens=200,
        temperature=0.7,
        do_sample=True,
        top_p=0.9,
    )
    return feedback_tokenizer.decode(outputs[0], skip_special_tokens=True)


def _generate_with_template(rubric_scores: dict, summary: str) -> str:
    """Generate structured feedback using rule-based templates."""
    feedback_parts = []
    total = 0
    max_total = 0

    for criterion, score_data in rubric_scores.items():
        score = score_data if isinstance(score_data, (int, float)) else score_data.get("score", 0)
        max_score = 10 if isinstance(score_data, (int, float)) else score_data.get("max", 10)
        total += score
        max_total += max_score
        pct = (score / max_score) * 100 if max_score > 0 else 0

        criterion_name = criterion.replace("_", " ").title()
        if pct >= 80:
            feedback_parts.append(f"Excellent work on {criterion_name} ({score}/{max_score}). The submission demonstrates strong competence in this area.")
        elif pct >= 60:
            feedback_parts.append(f"Good effort on {criterion_name} ({score}/{max_score}). Consider deepening your analysis and providing more detailed documentation to improve further.")
        elif pct >= 40:
            feedback_parts.append(f"{criterion_name} ({score}/{max_score}) needs improvement. Focus on addressing the core requirements and seek mentor guidance for this area.")
        else:
            feedback_parts.append(f"{criterion_name} ({score}/{max_score}) requires significant attention. Please review the rubric criteria and revise your work accordingly.")

    overall_pct = (total / max_total) * 100 if max_total > 0 else 0
    if overall_pct >= 75:
        intro = "Overall, this is a strong submission. "
    elif overall_pct >= 50:
        intro = "This submission shows promise but has areas for improvement. "
    else:
        intro = "This submission needs substantial revision before it meets the expected standards. "

    return intro + " ".join(feedback_parts)


def generate_feedback(rubric_scores: dict, summary: str) -> dict:
    """Generate evaluation feedback."""
    if USE_TRANSFORMER and feedback_model is not None:
        prompt = f"Generate constructive academic feedback for a student. Rubric scores: {rubric_scores}. Project summary: {summary}. Provide specific, actionable feedback in 3-4 sentences."
        feedback_text = _generate_with_transformer(prompt)
        model_name = "flan-t5"
    else:
        feedback_text = _generate_with_template(rubric_scores, summary)
        model_name = "template-v1"

    return {"feedback": feedback_text, "model": model_name}
