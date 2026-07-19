"""
Vector Store Service for Problem Statement Similarity Search.
Uses FAISS for efficient nearest-neighbor search on project embeddings.

Concepts from amitkaps/recommendation:
- Item similarity via dense vector spaces
- Efficient nearest-neighbor retrieval for content-based filtering
"""
import os
import json
import logging
import numpy as np
from typing import List, Dict, Optional, Tuple
from pathlib import Path

logger = logging.getLogger(__name__)

# Path for persisting the FAISS index and metadata
INDEX_DIR = Path(os.getenv("FAISS_INDEX_PATH", "data/faiss_index"))
INDEX_FILE = INDEX_DIR / "projects.index"
METADATA_FILE = INDEX_DIR / "projects_meta.json"

# Global state
_index = None
_project_metadata: List[Dict] = []


def _ensure_index_dir():
    """Create index directory if it doesn't exist."""
    INDEX_DIR.mkdir(parents=True, exist_ok=True)


def _get_or_create_index(dimension: int):
    """Get existing FAISS index or create a new one."""
    global _index
    if _index is not None:
        return _index

    try:
        import faiss

        # Try loading from disk first
        if INDEX_FILE.exists():
            logger.info(f"Loading FAISS index from {INDEX_FILE}")
            _index = faiss.read_index(str(INDEX_FILE))
            _load_metadata()
            logger.info(f"✅ Loaded FAISS index with {_index.ntotal} vectors")
            return _index

        # Create new index (IndexFlatIP for cosine similarity on normalized vectors)
        logger.info(f"Creating new FAISS index with dimension {dimension}")
        _index = faiss.IndexFlatIP(dimension)
        return _index

    except ImportError:
        logger.warning("⚠️ FAISS not installed. Using brute-force numpy fallback.")
        return None


def _load_metadata():
    """Load project metadata from disk."""
    global _project_metadata
    if METADATA_FILE.exists():
        with open(METADATA_FILE, "r", encoding="utf-8") as f:
            _project_metadata = json.load(f)
        logger.info(f"Loaded metadata for {len(_project_metadata)} projects")


def _save_metadata():
    """Save project metadata to disk."""
    _ensure_index_dir()
    with open(METADATA_FILE, "w", encoding="utf-8") as f:
        json.dump(_project_metadata, f, indent=2, default=str)


def _save_index():
    """Save FAISS index to disk."""
    global _index
    if _index is not None:
        try:
            import faiss
            _ensure_index_dir()
            faiss.write_index(_index, str(INDEX_FILE))
            logger.info(f"Saved FAISS index to {INDEX_FILE}")
        except ImportError:
            pass


# Brute-force fallback when FAISS is not available
_fallback_vectors: Optional[np.ndarray] = None


def add_projects(projects: List[Dict], embeddings: np.ndarray):
    """
    Add projects and their embeddings to the vector store.

    Args:
        projects: List of project metadata dicts (title, description, domain, etc.)
        embeddings: numpy array of shape (len(projects), embedding_dim)
    """
    global _index, _project_metadata, _fallback_vectors

    if len(projects) == 0:
        return

    dimension = embeddings.shape[1]
    index = _get_or_create_index(dimension)

    if index is not None:
        # Normalize embeddings for cosine similarity via inner product
        norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
        norms[norms == 0] = 1
        normalized = (embeddings / norms).astype(np.float32)
        index.add(normalized)
    else:
        # Fallback: store raw vectors
        if _fallback_vectors is None:
            _fallback_vectors = embeddings.astype(np.float32)
        else:
            _fallback_vectors = np.vstack([_fallback_vectors, embeddings.astype(np.float32)])

    _project_metadata.extend(projects)
    _save_index()
    _save_metadata()
    logger.info(f"Added {len(projects)} projects to vector store (total: {len(_project_metadata)})")


def search_similar(
    query_embedding: np.ndarray,
    top_k: int = 10,
    exclude_ids: Optional[List[str]] = None,
) -> List[Tuple[Dict, float]]:
    """
    Search for the most similar projects to a query embedding.

    Args:
        query_embedding: numpy array of shape (embedding_dim,)
        top_k: Number of results to return
        exclude_ids: Optional list of project IDs to exclude

    Returns:
        List of (project_metadata, similarity_score) tuples, sorted by similarity desc
    """
    global _index, _fallback_vectors

    if len(_project_metadata) == 0:
        logger.warning("Vector store is empty — no projects to compare against")
        return []

    # Normalize query
    query = query_embedding.reshape(1, -1).astype(np.float32)
    norm = np.linalg.norm(query)
    if norm > 0:
        query = query / norm

    results = []

    if _index is not None and _index.ntotal > 0:
        # FAISS search
        k = min(top_k + 10, _index.ntotal)  # Extra buffer for filtering
        scores, indices = _index.search(query, k)

        for score, idx in zip(scores[0], indices[0]):
            if idx < 0 or idx >= len(_project_metadata):
                continue
            project = _project_metadata[idx]
            if exclude_ids and project.get("id") in exclude_ids:
                continue
            # Convert inner product to percentage (already normalized, so score ∈ [-1, 1])
            similarity_pct = round(max(0, float(score)) * 100, 1)
            results.append((project, similarity_pct))
            if len(results) >= top_k:
                break

    elif _fallback_vectors is not None:
        # Numpy brute-force fallback
        norms = np.linalg.norm(_fallback_vectors, axis=1, keepdims=True)
        norms[norms == 0] = 1
        normalized = _fallback_vectors / norms
        similarities = (normalized @ query.T).flatten()

        ranked_indices = np.argsort(similarities)[::-1]
        for idx in ranked_indices:
            if idx >= len(_project_metadata):
                continue
            project = _project_metadata[int(idx)]
            if exclude_ids and project.get("id") in exclude_ids:
                continue
            similarity_pct = round(max(0, float(similarities[idx])) * 100, 1)
            results.append((project, similarity_pct))
            if len(results) >= top_k:
                break

    return results


def get_total_projects() -> int:
    """Return total number of indexed projects."""
    return len(_project_metadata)


def rebuild_index(projects: List[Dict], embeddings: np.ndarray):
    """
    Completely rebuild the vector store from scratch.

    Args:
        projects: Full list of project metadata
        embeddings: Corresponding embeddings array
    """
    global _index, _project_metadata, _fallback_vectors

    _index = None
    _project_metadata = []
    _fallback_vectors = None

    # Delete existing files
    if INDEX_FILE.exists():
        INDEX_FILE.unlink()
    if METADATA_FILE.exists():
        METADATA_FILE.unlink()

    if len(projects) > 0:
        add_projects(projects, embeddings)

    logger.info(f"Rebuilt vector store with {len(projects)} projects")


def initialize_vector_store():
    """Initialize the vector store (called during app startup)."""
    from app.services.embedding_service import get_embedding_dimension
    dimension = get_embedding_dimension()
    _get_or_create_index(dimension)

    # If empty, load seed data
    if len(_project_metadata) == 0:
        _load_seed_data()


def _load_seed_data():
    """Load seed projects from JSON file if the index is empty."""
    seed_file = Path("data/seed_projects.json")
    if not seed_file.exists():
        logger.info("No seed data found — vector store will start empty")
        return

    try:
        with open(seed_file, "r", encoding="utf-8") as f:
            seed_projects = json.load(f)

        if not seed_projects:
            return

        from app.services.embedding_service import generate_embedding, combine_text_for_embedding

        logger.info(f"Indexing {len(seed_projects)} seed projects...")
        embeddings = []
        for proj in seed_projects:
            text = combine_text_for_embedding(
                title=proj.get("title", ""),
                description=proj.get("description", ""),
                domain=proj.get("domain", ""),
                tech_stack=proj.get("tech_stack", []),
            )
            emb = generate_embedding(text)
            embeddings.append(emb)

        embeddings_array = np.array(embeddings, dtype=np.float32)
        add_projects(seed_projects, embeddings_array)
        logger.info(f"✅ Seeded vector store with {len(seed_projects)} projects")

    except Exception as e:
        logger.error(f"Failed to load seed data: {e}")
