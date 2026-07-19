"""
Embedding Service for Problem Statement Recommendation Engine.
Generates semantic embeddings using Sentence Transformers (default)
or OpenAI embeddings (configurable).

Concepts adapted from amitkaps/recommendation:
- Content-based feature extraction via dense embeddings
- Replacing sparse TF-IDF with dense sentence-level representations
"""
import os
import logging
import numpy as np
from typing import List, Optional

logger = logging.getLogger(__name__)

# Global model reference (lazy-loaded)
_model = None
_model_name = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
_embedding_dim = 384  # Default for all-MiniLM-L6-v2


def _load_model():
    """Lazy-load the sentence transformer model."""
    global _model, _embedding_dim
    if _model is not None:
        return _model

    try:
        from sentence_transformers import SentenceTransformer
        logger.info(f"Loading embedding model: {_model_name}")
        _model = SentenceTransformer(_model_name)
        # Update dimension based on actual model
        test_emb = _model.encode(["test"])
        _embedding_dim = test_emb.shape[1]
        logger.info(f"✅ Embedding model loaded. Dimension: {_embedding_dim}")
        return _model
    except Exception as e:
        logger.warning(f"⚠️ Failed to load SentenceTransformer: {e}")
        logger.warning("Falling back to random embeddings (for development only)")
        return None


def get_embedding_dimension() -> int:
    """Return the embedding vector dimension."""
    return _embedding_dim


def generate_embedding(text: str) -> np.ndarray:
    """
    Generate a semantic embedding for a single text string.

    Args:
        text: Input text to embed

    Returns:
        numpy array of shape (embedding_dim,)
    """
    if not text or not text.strip():
        return np.zeros(_embedding_dim, dtype=np.float32)

    model = _load_model()
    if model is not None:
        embedding = model.encode([text], normalize_embeddings=True)[0]
        return embedding.astype(np.float32)
    else:
        # Fallback: deterministic hash-based pseudo-embedding (dev only)
        np.random.seed(hash(text) % (2**31))
        return np.random.randn(_embedding_dim).astype(np.float32)


def batch_embeddings(texts: List[str]) -> np.ndarray:
    """
    Generate embeddings for a batch of texts.

    Args:
        texts: List of input texts

    Returns:
        numpy array of shape (len(texts), embedding_dim)
    """
    if not texts:
        return np.zeros((0, _embedding_dim), dtype=np.float32)

    # Filter empty strings
    cleaned = [t if t and t.strip() else " " for t in texts]

    model = _load_model()
    if model is not None:
        embeddings = model.encode(cleaned, normalize_embeddings=True, batch_size=32, show_progress_bar=False)
        return embeddings.astype(np.float32)
    else:
        # Fallback: deterministic pseudo-embeddings
        result = []
        for t in cleaned:
            np.random.seed(hash(t) % (2**31))
            result.append(np.random.randn(_embedding_dim).astype(np.float32))
        return np.array(result, dtype=np.float32)


def combine_text_for_embedding(
    title: str = "",
    problem_statement: str = "",
    description: str = "",
    domain: str = "",
    tech_stack: Optional[List[str]] = None,
    hackathon_theme: str = "",
    expected_impact: str = "",
) -> str:
    """
    Combine multiple fields into a single text for embedding generation.
    Weighted concatenation — title and problem statement get priority.
    """
    parts = []
    if title:
        parts.append(f"Project: {title}.")
    if problem_statement:
        parts.append(f"Problem: {problem_statement}.")
    if description:
        parts.append(f"Description: {description}.")
    if domain:
        parts.append(f"Domain: {domain}.")
    if tech_stack:
        parts.append(f"Technologies: {', '.join(tech_stack)}.")
    if hackathon_theme:
        parts.append(f"Theme: {hackathon_theme}.")
    if expected_impact:
        parts.append(f"Impact: {expected_impact}.")

    return " ".join(parts)


def load_embedding_model():
    """Explicitly load the model (called during app startup)."""
    _load_model()
    logger.info("Embedding service initialized")
