"""
Redis Cache Wrapper for CapstoneX AI Service.
Provides optional caching with graceful degradation when Redis is unavailable.
"""
import json
import logging
import hashlib
from typing import Optional, Any

logger = logging.getLogger(__name__)

_redis_client = None
_redis_available = False


def init_cache(redis_url: Optional[str] = None):
    """Initialize Redis connection. Fails gracefully if unavailable."""
    global _redis_client, _redis_available

    if not redis_url:
        logger.info("ℹ️  Redis URL not configured — caching disabled")
        return

    try:
        import redis.asyncio as aioredis
        _redis_client = aioredis.from_url(
            redis_url,
            encoding="utf-8",
            decode_responses=True,
            socket_connect_timeout=3,
            retry_on_timeout=True,
        )
        _redis_available = True
        logger.info("✅ Redis cache initialized")
    except ImportError:
        logger.warning("⚠️  redis package not installed — caching disabled")
    except Exception as e:
        logger.warning(f"⚠️  Redis connection failed: {e} — caching disabled")


def is_available() -> bool:
    """Check if Redis is available."""
    return _redis_available and _redis_client is not None


def _make_key(namespace: str, identifier: str) -> str:
    """Generate a cache key."""
    return f"capstonex:{namespace}:{identifier}"


def _hash_key(text: str) -> str:
    """Create a short hash for cache keys from long text inputs."""
    return hashlib.sha256(text.encode()).hexdigest()[:16]


async def get(namespace: str, key: str) -> Optional[Any]:
    """Get a cached value. Returns None if cache miss or Redis unavailable."""
    if not is_available():
        return None
    try:
        raw = await _redis_client.get(_make_key(namespace, key))
        if raw is not None:
            return json.loads(raw)
    except Exception as e:
        logger.debug(f"Cache get error: {e}")
    return None


async def set(namespace: str, key: str, value: Any, ttl: int = 3600):
    """Set a cached value with TTL. Silently fails if Redis unavailable."""
    if not is_available():
        return
    try:
        await _redis_client.setex(
            _make_key(namespace, key),
            ttl,
            json.dumps(value, default=str),
        )
    except Exception as e:
        logger.debug(f"Cache set error: {e}")


async def delete(namespace: str, key: str):
    """Delete a cached value."""
    if not is_available():
        return
    try:
        await _redis_client.delete(_make_key(namespace, key))
    except Exception as e:
        logger.debug(f"Cache delete error: {e}")


async def invalidate_namespace(namespace: str):
    """Invalidate all keys in a namespace."""
    if not is_available():
        return
    try:
        pattern = _make_key(namespace, "*")
        cursor = 0
        while True:
            cursor, keys = await _redis_client.scan(cursor, match=pattern, count=100)
            if keys:
                await _redis_client.delete(*keys)
            if cursor == 0:
                break
    except Exception as e:
        logger.debug(f"Cache invalidation error: {e}")


# ──────────────────────────────────────────
# Domain-specific cache helpers
# ──────────────────────────────────────────

async def get_embedding(text: str):
    """Get cached embedding for text."""
    return await get("embedding", _hash_key(text))


async def set_embedding(text: str, embedding_list: list, ttl: int = 86400):
    """Cache embedding (24h TTL by default)."""
    await set("embedding", _hash_key(text), embedding_list, ttl)


async def get_prediction(model_name: str, feature_hash: str):
    """Get cached prediction."""
    return await get(f"prediction:{model_name}", feature_hash)


async def set_prediction(model_name: str, feature_hash: str, result: dict, ttl: int = 1800):
    """Cache prediction (30 min TTL by default)."""
    await set(f"prediction:{model_name}", feature_hash, result, ttl)
