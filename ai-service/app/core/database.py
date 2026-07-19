"""
Database Access Layer for CapstoneX AI Service.
Provides async SQLAlchemy engine for direct PostgreSQL queries.
Used by ML pipelines to extract training data and features.
"""
import logging
from typing import Optional, List, Dict, Any
from contextlib import asynccontextmanager

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import text

logger = logging.getLogger(__name__)

_engine = None
_session_factory = None


def init_database(database_url: str, pool_size: int = 5, max_overflow: int = 10):
    """Initialize the async database engine."""
    global _engine, _session_factory

    # Ensure we use asyncpg driver
    if "postgresql://" in database_url and "+asyncpg" not in database_url:
        database_url = database_url.replace("postgresql://", "postgresql+asyncpg://")

    _engine = create_async_engine(
        database_url,
        pool_size=pool_size,
        max_overflow=max_overflow,
        pool_pre_ping=True,
        echo=False,
    )
    _session_factory = async_sessionmaker(_engine, class_=AsyncSession, expire_on_commit=False)
    logger.info("✅ Database engine initialized")


@asynccontextmanager
async def get_session():
    """Get an async database session."""
    if _session_factory is None:
        raise RuntimeError("Database not initialized. Call init_database() first.")
    async with _session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def fetch_all(query: str, params: Optional[Dict] = None) -> List[Dict[str, Any]]:
    """Execute a SELECT query and return all rows as dicts."""
    async with get_session() as session:
        result = await session.execute(text(query), params or {})
        columns = result.keys()
        return [dict(zip(columns, row)) for row in result.fetchall()]


async def fetch_one(query: str, params: Optional[Dict] = None) -> Optional[Dict[str, Any]]:
    """Execute a SELECT query and return the first row as a dict."""
    async with get_session() as session:
        result = await session.execute(text(query), params or {})
        row = result.fetchone()
        if row is None:
            return None
        return dict(zip(result.keys(), row))


async def execute(query: str, params: Optional[Dict] = None) -> int:
    """Execute an INSERT/UPDATE/DELETE and return affected row count."""
    async with get_session() as session:
        result = await session.execute(text(query), params or {})
        return result.rowcount


async def count_records(table: str, where: str = "1=1") -> int:
    """Count records in a table with optional WHERE clause."""
    row = await fetch_one(f"SELECT COUNT(*) as cnt FROM {table} WHERE {where}")
    return row["cnt"] if row else 0


# ──────────────────────────────────────────
# Domain-Specific Queries for ML Pipelines
# ──────────────────────────────────────────

async def get_all_projects_for_indexing() -> List[Dict]:
    """Fetch all projects (topics + previous_projects) for FAISS indexing."""
    topics = await fetch_all("""
        SELECT t.id, t.title, t.abstract as description, t.domain_tags, t.technology_tags,
               t.status, t.ai_scores, g.department, g.batch_year
        FROM topics t
        LEFT JOIN groups g ON t.group_id = g.id
        WHERE t.status IN ('approved', 'submitted', 'pending')
    """)

    previous = await fetch_all("""
        SELECT id, title, description, domain, tech_stack, year, outcome
        FROM previous_projects
    """)

    projects = []
    for t in topics:
        projects.append({
            "id": str(t["id"]),
            "title": t["title"],
            "description": t.get("description", ""),
            "domain": ", ".join(t.get("domain_tags") or []),
            "tech_stack": t.get("technology_tags") or [],
            "status": t.get("status", ""),
            "department": t.get("department", ""),
            "year": t.get("batch_year"),
            "source": "topic",
        })

    for p in previous:
        projects.append({
            "id": str(p["id"]),
            "title": p["title"],
            "description": p.get("description", ""),
            "domain": p.get("domain", ""),
            "tech_stack": p.get("tech_stack") or [],
            "status": p.get("outcome", ""),
            "year": p.get("year"),
            "source": "previous_project",
        })

    return projects


async def get_group_features(group_id: str) -> Dict[str, Any]:
    """Extract real-time features for a group for risk prediction."""
    # Logbook statistics
    logbook_stats = await fetch_one("""
        SELECT
            COUNT(*) as total_logbooks,
            COUNT(CASE WHEN status = 'on_time' THEN 1 END) as on_time_count,
            COUNT(CASE WHEN status = 'late' THEN 1 END) as late_count,
            MAX(week_number) as latest_week
        FROM logbooks WHERE group_id = :gid
    """, {"gid": group_id})

    # Evaluation statistics
    eval_stats = await fetch_one("""
        SELECT
            COUNT(*) as eval_count,
            AVG(total_score) as avg_score,
            MIN(total_score) as min_score,
            MAX(total_score) as max_score
        FROM evaluations WHERE group_id = :gid AND total_score IS NOT NULL
    """, {"gid": group_id})

    # Meeting statistics
    meeting_stats = await fetch_one("""
        SELECT
            COUNT(*) as total_meetings,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_meetings
        FROM meetings WHERE group_id = :gid
    """, {"gid": group_id})

    # Member count
    member_count = await fetch_one("""
        SELECT COUNT(*) as cnt FROM group_members
        WHERE group_id = :gid AND status = 'accepted'
    """, {"gid": group_id})

    # Logbook feedback statistics
    feedback_stats = await fetch_one("""
        SELECT
            COUNT(*) as feedback_count,
            COUNT(CASE WHEN lf.status = 'approved' THEN 1 END) as approved_count,
            COUNT(CASE WHEN lf.status = 'rejected' THEN 1 END) as rejected_count
        FROM logbook_feedback lf
        JOIN logbooks l ON lf.logbook_id = l.id
        WHERE l.group_id = :gid
    """, {"gid": group_id})

    total_logbooks = logbook_stats["total_logbooks"] if logbook_stats else 0
    on_time = logbook_stats["on_time_count"] if logbook_stats else 0

    return {
        "submission_rate": on_time / max(total_logbooks, 1),
        "avg_days_late": (logbook_stats["late_count"] if logbook_stats else 0) * 3,  # estimate
        "mentor_feedback_score": (
            (feedback_stats["approved_count"] / max(feedback_stats["feedback_count"], 1)) * 10
            if feedback_stats else 5
        ),
        "login_frequency_7d": 10,  # placeholder until activity tracking is added
        "evaluation_score_avg": float(eval_stats["avg_score"]) if eval_stats and eval_stats["avg_score"] else 50,
        "group_size": member_count["cnt"] if member_count else 1,
        "topic_approval_delay_days": 5,  # placeholder
        "total_logbooks": total_logbooks,
        "total_meetings": meeting_stats["total_meetings"] if meeting_stats else 0,
        "completed_meetings": meeting_stats["completed_meetings"] if meeting_stats else 0,
        "mentor_meeting_frequency": (
            meeting_stats["completed_meetings"] / max(meeting_stats["total_meetings"], 1)
            if meeting_stats else 0
        ),
        "task_completion_rate": on_time / max(total_logbooks, 1),
        "feedback_approval_rate": (
            feedback_stats["approved_count"] / max(feedback_stats["feedback_count"], 1)
            if feedback_stats else 0
        ),
        "eval_count": eval_stats["eval_count"] if eval_stats else 0,
        "eval_min_score": float(eval_stats["min_score"]) if eval_stats and eval_stats["min_score"] else 0,
    }


async def get_student_profile(student_id: str) -> Dict[str, Any]:
    """Build comprehensive student profile for recommendations."""
    user = await fetch_one("""
        SELECT id, name, department, skills, interests
        FROM users WHERE id = :sid
    """, {"sid": student_id})

    if not user:
        return {}

    # Past performance
    eval_avg = await fetch_one("""
        SELECT AVG(e.total_score) as avg_score, COUNT(*) as eval_count
        FROM evaluations e WHERE e.student_id = :sid AND e.total_score IS NOT NULL
    """, {"sid": student_id})

    # Groups participated
    group_count = await fetch_one("""
        SELECT COUNT(*) as cnt FROM group_members
        WHERE student_id = :sid AND status = 'accepted'
    """, {"sid": student_id})

    return {
        "id": str(user["id"]),
        "name": user["name"],
        "department": user.get("department", ""),
        "skills": user.get("skills") or [],
        "interests": user.get("interests") or [],
        "avg_evaluation_score": float(eval_avg["avg_score"]) if eval_avg and eval_avg["avg_score"] else None,
        "evaluation_count": eval_avg["eval_count"] if eval_avg else 0,
        "groups_participated": group_count["cnt"] if group_count else 0,
    }


async def get_training_data_risk() -> List[Dict]:
    """Extract historical data for risk model training."""
    return await fetch_all("""
        SELECT
            g.id as group_id,
            g.status as group_status,
            g.department,
            COUNT(DISTINCT l.id) as logbook_count,
            COUNT(DISTINCT CASE WHEN l.status = 'on_time' THEN l.id END) as on_time_count,
            COUNT(DISTINCT CASE WHEN l.status = 'late' THEN l.id END) as late_count,
            COUNT(DISTINCT m.id) as meeting_count,
            COUNT(DISTINCT CASE WHEN m.status = 'completed' THEN m.id END) as completed_meeting_count,
            AVG(e.total_score) as avg_eval_score,
            COUNT(DISTINCT e.id) as eval_count,
            COUNT(DISTINCT gm.id) as member_count,
            COUNT(DISTINCT lf.id) as feedback_count,
            COUNT(DISTINCT CASE WHEN lf.status = 'approved' THEN lf.id END) as approved_feedback
        FROM groups g
        LEFT JOIN logbooks l ON l.group_id = g.id
        LEFT JOIN meetings m ON m.group_id = g.id
        LEFT JOIN evaluations e ON e.group_id = g.id
        LEFT JOIN group_members gm ON gm.group_id = g.id AND gm.status = 'accepted'
        LEFT JOIN logbook_feedback lf ON lf.logbook_id = l.id
        GROUP BY g.id, g.status, g.department
        HAVING COUNT(DISTINCT l.id) > 0 OR COUNT(DISTINCT e.id) > 0
    """)


async def check_health() -> bool:
    """Check database connectivity."""
    try:
        result = await fetch_one("SELECT 1 as ok")
        return result is not None and result.get("ok") == 1
    except Exception:
        return False
