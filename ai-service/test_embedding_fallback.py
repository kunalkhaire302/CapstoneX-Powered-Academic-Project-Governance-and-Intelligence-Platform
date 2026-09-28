import numpy as np

from app.services.embedding_service import batch_embeddings, generate_embedding


def test_hashing_embeddings_are_deterministic(monkeypatch):
    monkeypatch.setenv("EMBEDDING_PROVIDER", "hashing")

    first = generate_embedding("student attendance risk")
    second = generate_embedding("student attendance risk")
    batch = batch_embeddings(["student attendance risk", "unrelated topic"])

    assert first.shape == (384,)
    assert batch.shape == (2, 384)
    assert np.array_equal(first, second)
    assert np.array_equal(first, batch[0])
    assert not np.array_equal(batch[0], batch[1])
