from pydantic import BaseModel, Field
from typing import List, Optional


class RecommendRequest(BaseModel):
    student_id: str
    skills: List[str] = Field(default_factory=list)
    interests: List[str] = Field(default_factory=list)
    technologies: List[str] = Field(default_factory=list)


class RecommendationItem(BaseModel):
    domain: str
    match_score: float = Field(ge=0, le=1)
    reason: str


class RecommendResponse(BaseModel):
    recommendations: List[RecommendationItem]
    model_version: str = "1.0"


class RiskRequest(BaseModel):
    group_id: str
    features: dict = Field(default_factory=dict)


class RiskResponse(BaseModel):
    risk_label: str
    probability: float
    feature_importances: dict = Field(default_factory=dict)
    model_version: str = "1.0"


class FeedbackRequest(BaseModel):
    rubric_scores: dict
    summary: str


class FeedbackResponse(BaseModel):
    feedback: str
    model: str = "flan-t5-small"


class TeamFormationRequest(BaseModel):
    students: List[dict]
    team_size: int = Field(ge=2, le=10, default=4)


class TeamFormationResponse(BaseModel):
    teams: List[List[str]]
    diversity_scores: List[float] = Field(default_factory=list)
