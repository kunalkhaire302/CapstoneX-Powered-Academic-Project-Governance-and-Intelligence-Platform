import os
from dotenv import load_dotenv
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import logging

load_dotenv()

from app.routers import recommend, risk, feedback, teams, problem_recommend
from app.dependencies import verify_internal_token

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="CapstoneX AI Service",
    description="AI/ML microservice for project recommendations, risk prediction, feedback generation, and team formation.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000"), os.getenv("BACKEND_URL", "http://localhost:5000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(recommend.router, prefix="/api/ai", tags=["Recommendations"], dependencies=[Depends(verify_internal_token)])
app.include_router(risk.router, prefix="/api/ai", tags=["Risk Prediction"], dependencies=[Depends(verify_internal_token)])
app.include_router(feedback.router, prefix="/api/ai", tags=["Feedback Generation"], dependencies=[Depends(verify_internal_token)])
app.include_router(teams.router, prefix="/api/ai", tags=["Team Formation"], dependencies=[Depends(verify_internal_token)])
app.include_router(problem_recommend.router, prefix="/api/ai", tags=["Problem Statement Recommendation"], dependencies=[Depends(verify_internal_token)])


@app.get("/api/ai/health")
async def health_check():
    return {"status": "healthy", "service": "capstonex-ai-service"}


@app.on_event("startup")
async def startup_event():
    """Load ML models on startup."""
    logger.info("🚀 CapstoneX AI Service starting...")
    from app.services.risk_service import load_risk_model
    from app.services.feedback_service import load_feedback_model
    from app.services.embedding_service import load_embedding_model
    from app.services.vector_store import initialize_vector_store
    load_risk_model()
    load_feedback_model()
    load_embedding_model()
    initialize_vector_store()
    logger.info("✅ All models loaded successfully")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
