from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field, field_validator


AgentKey = Literal[
    "head_agent", "project_analyst", "technical_reviewer", "research_agent",
    "documentation_agent", "progress_monitor", "quality_auditor",
    "recommendation_agent", "communication_agent",
]


class AgentTeamRequest(BaseModel):
    run_id: str
    project_id: str
    workflow: Literal["proposal_review", "progress_review", "technical_review"] = "proposal_review"
    objective: str = Field(min_length=20, max_length=4000)
    context: Dict[str, Any] = Field(default_factory=dict)
    constraints: List[str] = Field(default_factory=list, max_length=20)
    selected_agents: List[AgentKey]
    max_revisions: int = Field(default=1, ge=0, le=2)

    @field_validator("selected_agents")
    @classmethod
    def require_governance_agents(cls, value: List[AgentKey]) -> List[AgentKey]:
        if "head_agent" not in value or "quality_auditor" not in value:
            raise ValueError("head_agent and quality_auditor are required")
        return list(dict.fromkeys(value))


class Evidence(BaseModel):
    id: str = Field(min_length=1, max_length=80)
    type: Literal["project_context", "provided_source", "derived_check", "missing_evidence"]
    title: str = Field(min_length=1, max_length=300)
    detail: str = Field(default="", max_length=1200)
    source_url: Optional[str] = Field(default=None, max_length=2000)


class Finding(BaseModel):
    title: str = Field(min_length=1, max_length=300)
    detail: str = Field(min_length=1, max_length=2000)
    severity: Literal["info", "low", "medium", "high", "critical"] = "info"
    evidence_ids: List[str] = Field(default_factory=list, max_length=12)


class WorkerResult(BaseModel):
    agent: AgentKey
    status: Literal["completed", "failed", "needs_revision"] = "completed"
    confidence: float = Field(ge=0, le=1)
    summary: str = Field(min_length=1, max_length=3000)
    findings: List[Finding] = Field(default_factory=list, max_length=12)
    recommendations: List[str] = Field(default_factory=list, max_length=12)
    evidence: List[Evidence] = Field(default_factory=list, max_length=20)
    requires_human_review: bool = True
    model_source: Literal["llm", "deterministic_fallback"]
    latency_ms: int = Field(default=0, ge=0)
    usage: Dict[str, Any] = Field(default_factory=dict)
    error: Optional[str] = None


class QualityReport(BaseModel):
    passed: bool
    score: float = Field(ge=0, le=1)
    evidence_coverage: float = Field(ge=0, le=1)
    consistency_score: float = Field(ge=0, le=1)
    revision_required: bool
    issues: List[str] = Field(default_factory=list, max_length=20)
    reviewed_agents: List[str] = Field(default_factory=list)


class FinalReport(BaseModel):
    executive_summary: str
    decision: Literal["ready_for_human_review", "revision_recommended", "insufficient_evidence"]
    strengths: List[str] = Field(default_factory=list)
    risks: List[str] = Field(default_factory=list)
    prioritized_actions: List[str] = Field(default_factory=list)
    evidence_ids: List[str] = Field(default_factory=list)
    human_review_notes: List[str] = Field(default_factory=list)


class AgentTeamResponse(BaseModel):
    run_id: str
    project_id: str
    status: Literal["completed", "failed"]
    confidence: float = Field(ge=0, le=1)
    plan: List[Dict[str, Any]]
    tasks: List[WorkerResult]
    quality: QualityReport
    final_report: FinalReport
    requires_human_approval: bool = True
    usage: Dict[str, Any] = Field(default_factory=dict)
    estimated_cost: float = Field(default=0, ge=0)
    error: Optional[str] = None
