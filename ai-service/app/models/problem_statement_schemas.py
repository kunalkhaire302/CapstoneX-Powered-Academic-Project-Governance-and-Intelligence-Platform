"""
Pydantic schemas for Problem Statement Recommendation API.
Defines request/response models for all recommendation endpoints.
"""
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from enum import Enum


# ──────────────────────────────────────────────────────────
# Request Models
# ──────────────────────────────────────────────────────────

class ProblemStatementInput(BaseModel):
    """Input model collecting all 13 student fields."""
    title: str = Field(..., min_length=3, max_length=500, description="Project title")
    problem_statement: str = Field(..., min_length=10, description="Core problem being solved")
    description: str = Field(default="", description="Detailed project description")
    domain: str = Field(default="", description="Project domain (e.g., AI/ML, Web Development)")
    department: str = Field(default="", description="Student's academic department")
    skills: List[str] = Field(default_factory=list, description="Student's listed skills")
    tech_stack: List[str] = Field(default_factory=list, description="Planned technologies")
    team_members: Optional[List[Dict]] = Field(default=None, description="Team member details with skills")
    hackathon_theme: str = Field(default="", description="Hackathon theme or track")
    expected_users: str = Field(default="", description="Who will use the product")
    target_audience: str = Field(default="", description="Target audience description")
    expected_impact: str = Field(default="", description="Expected real-world impact")
    duration: str = Field(default="", description="Project/hackathon duration")

    # Optional context
    student_id: Optional[str] = Field(default=None, description="Student's user ID")
    group_id: Optional[str] = Field(default=None, description="Group ID")


class ImproveRequest(BaseModel):
    """Input for improvement-only suggestions."""
    title: str
    problem_statement: str
    description: str = ""
    domain: str = ""
    tech_stack: List[str] = Field(default_factory=list)
    scores: Dict[str, int] = Field(default_factory=dict, description="Current scores")
    similar_projects: List[Dict] = Field(default_factory=list)


class RescoreRequest(ProblemStatementInput):
    """Input for re-scoring (same as analyze but tagged as rescore)."""
    previous_recommendation_id: Optional[str] = None


# ──────────────────────────────────────────────────────────
# Response Models
# ──────────────────────────────────────────────────────────

class RecommendationScores(BaseModel):
    """8-dimension recommendation scores (0-100)."""
    domain_match: int = Field(ge=0, le=100)
    uniqueness: int = Field(ge=0, le=100)
    innovation: int = Field(ge=0, le=100)
    impact: int = Field(ge=0, le=100)
    feasibility: int = Field(ge=0, le=100)
    skill_match: int = Field(ge=0, le=100)
    commercial_potential: int = Field(ge=0, le=100)
    overall: int = Field(ge=0, le=100)


class SimilarProject(BaseModel):
    """A project similar to the submitted idea."""
    id: str = ""
    title: str
    domain: str = ""
    similarity: float = Field(ge=0, le=100, description="Similarity percentage")
    reason: str = Field(description="Why they are similar")


class Warning(BaseModel):
    """Warning message for high-similarity or other issues."""
    type: str
    message: str
    severity: str = "warning"  # "info", "warning", "critical"


class DomainAnalysis(BaseModel):
    """Domain identification results."""
    primary_domain: str
    secondary_domains: List[str] = Field(default_factory=list)
    domain_confidence: float = 0
    all_domains: Dict[str, float] = Field(default_factory=dict)


class AISuggestions(BaseModel):
    """AI-generated suggestions and recommendations."""
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    missing_features: List[str] = Field(default_factory=list)
    unique_features: List[str] = Field(default_factory=list)
    future_scope: List[str] = Field(default_factory=list)
    tech_recommendations: List[str] = Field(default_factory=list)
    business_model_suggestions: List[str] = Field(default_factory=list)
    potential_users: List[str] = Field(default_factory=list)
    risks: List[str] = Field(default_factory=list)
    improvement_suggestions: List[str] = Field(default_factory=list)
    recommended_apis: List[str] = Field(default_factory=list)
    recommended_frameworks: List[str] = Field(default_factory=list)
    recommended_datasets: List[str] = Field(default_factory=list)


class RecommendationReport(BaseModel):
    """Complete recommendation report — the main response model."""
    scores: RecommendationScores
    similar_projects: List[SimilarProject] = Field(default_factory=list)
    ai_suggestions: AISuggestions
    sdg_alignment: List[str] = Field(default_factory=list)
    keywords: List[str] = Field(default_factory=list)
    domain_analysis: DomainAnalysis
    warnings: List[Warning] = Field(default_factory=list)
    total_projects_compared: int = 0
    model_version: str = "2.0-hybrid-embedding"


class ImproveResponse(BaseModel):
    """Response for improvement-only requests."""
    improvement_suggestions: List[str] = Field(default_factory=list)
    missing_features: List[str] = Field(default_factory=list)
    tech_recommendations: List[str] = Field(default_factory=list)
    recommended_frameworks: List[str] = Field(default_factory=list)
    risks: List[str] = Field(default_factory=list)
