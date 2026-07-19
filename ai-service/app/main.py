"""
CapstoneX AI Service — Main Application Entry Point.
FastAPI application with async lifespan management for ML model loading,
database initialization, and vector store setup.
"""
import os
import logging
from contextlib import asynccontextmanager
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.dependencies import verify_internal_token

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application startup and shutdown lifecycle."""
    logger.info("🚀 CapstoneX AI Service starting...")

    # 1. Load configuration
    try:
        from app.core.config import get_settings
        settings = get_settings()
        logger.info(f"   Config loaded: LLM={settings.LLM_PROVIDER}, Model={settings.EMBEDDING_MODEL}")
    except Exception as e:
        logger.warning(f"⚠️  Config validation warning: {e} — using defaults where possible")
        settings = None

    # 2. Initialize database connection
    try:
        from app.core.database import init_database
        db_url = os.getenv("DATABASE_URL", "postgresql+asyncpg://capstonex:capstonex_pass@localhost:5432/capstonex_db")
        init_database(db_url)
        logger.info("   ✅ Database connection initialized")
    except Exception as e:
        logger.warning(f"⚠️  Database init skipped: {e}")

    # 3. Initialize Redis cache (optional)
    try:
        from app.core.cache import init_cache
        init_cache(os.getenv("REDIS_URL"))
    except Exception as e:
        logger.warning(f"⚠️  Cache init skipped: {e}")

    # 4. Load ML models
    from app.services.risk_service import load_risk_model
    from app.services.embedding_service import load_embedding_model
    from app.services.vector_store import initialize_vector_store

    load_risk_model()
    # Feedback model is now handled by llm_service
    load_embedding_model()
    initialize_vector_store()

    logger.info("✅ All models loaded successfully")
    
    # 5. Start background tasks
    from app.core.tasks import start_background_tasks, stop_background_tasks
    await start_background_tasks()

    logger.info(f"🌐 CapstoneX AI Service v2.0 ready")

    yield  # Application runs here

    # Shutdown
    logger.info("🛑 CapstoneX AI Service shutting down...")
    await stop_background_tasks()


# ──────────────────────────────────────────
# Application Factory
# ──────────────────────────────────────────

app = FastAPI(
    title="CapstoneX AI Service",
    description=(
        "Production-grade AI/ML microservice for the CapstoneX platform. "
        "Provides project recommendations, risk prediction, plagiarism detection, "
        "team formation, feedback generation, and continuous learning."
    ),
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("FRONTEND_URL", "http://localhost:3000"),
        os.getenv("BACKEND_URL", "http://localhost:5000"),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ──────────────────────────────────────────
# Routers
# ──────────────────────────────────────────

from app.routers import recommend, risk, teams, nlp, reports

# Existing routers
app.include_router(
    recommend.router, prefix="/api/ai", tags=["Recommendations"],
    dependencies=[Depends(verify_internal_token)],
)
app.include_router(
    risk.router, prefix="/api/ai", tags=["Risk Prediction"],
    dependencies=[Depends(verify_internal_token)],
)
app.include_router(
    teams.router, prefix="/api/ai", tags=["Team Formation"],
    dependencies=[Depends(verify_internal_token)],
)
app.include_router(
    nlp.feedback_router, prefix="/api/ai", tags=["Feedback Generation"],
    dependencies=[Depends(verify_internal_token)],
)
app.include_router(
    nlp.problem_router, prefix="/api/ai", tags=["Problem Statement Analysis"],
    dependencies=[Depends(verify_internal_token)],
)
app.include_router(
    reports.router, prefix="/api/ai", tags=["Reports Generation"],
    dependencies=[Depends(verify_internal_token)],
)

# New routers (lazy import to avoid circular deps)
try:
    from app.routers import plagiarism
    app.include_router(
        plagiarism.router, prefix="/api/ai", tags=["Plagiarism Detection"],
        dependencies=[Depends(verify_internal_token)],
    )
except ImportError:
    logger.debug("Plagiarism router not yet available")

try:
    from app.routers import retraining
    app.include_router(
        retraining.router, prefix="/api/ai", tags=["Model Retraining"],
        dependencies=[Depends(verify_internal_token)],
    )
except ImportError:
    logger.debug("Retraining router not yet available")

try:
    from app.routers import monitoring
    app.include_router(
        monitoring.router, prefix="/api/ai", tags=["Monitoring"],
        dependencies=[Depends(verify_internal_token)],
    )
except ImportError:
    logger.debug("Monitoring router not yet available")


# ──────────────────────────────────────────
# Health & Status Endpoints
# ──────────────────────────────────────────

@app.get("/api/ai/health")
async def health_check():
    """Basic health check — always responds if the service is running."""
    return {"status": "healthy", "service": "capstonex-ai-service", "version": "2.0.0"}


@app.get("/api/ai/health/detailed")
async def detailed_health():
    """Detailed health check with model readiness status."""
    from app.services.risk_service import risk_pipeline
    from app.services.embedding_service import _model as embedding_model
    from app.services.vector_store import get_total_projects
    from app.core.cache import is_available as cache_available

    db_ok = False
    try:
        from app.core.database import check_health
        db_ok = await check_health()
    except Exception:
        pass

    return {
        "status": "healthy",
        "service": "capstonex-ai-service",
        "version": "2.0.0",
        "models": {
            "risk_model": "loaded" if risk_pipeline is not None else "not_loaded",
            "embedding_model": "loaded" if embedding_model is not None else "not_loaded",
            "vector_store_projects": get_total_projects(),
        },
        "infrastructure": {
            "database": "connected" if db_ok else "disconnected",
            "cache": "connected" if cache_available() else "disabled",
        },
    }


# ──────────────────────────────────────────
# Global Exception Handler
# ──────────────────────────────────────────

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch-all exception handler for unhandled errors."""
    from app.core.exceptions import CapstoneXAIError

    if isinstance(exc, CapstoneXAIError):
        logger.warning(f"AI Error: {exc.message}", extra=exc.details)
        return JSONResponse(
            status_code=422,
            content={"error": exc.message, "details": exc.details},
        )

    logger.error(f"Unhandled error: {type(exc).__name__}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal AI service error", "type": type(exc).__name__},
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
