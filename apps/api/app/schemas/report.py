from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field
from app.schemas.dependency import Dependency
from app.schemas.finding import Finding


class InvestigationReport(BaseModel):
    id: str
    project_name: str
    project_version: Optional[str] = None
    project_path: str
    created_at: str
    tool_version: str = "0.1.0"
    total_dependencies: int = 0
    direct_dependencies: int = 0
    outdated_count: int = 0
    inactive_count: int = 0
    security_count: int = 0
    unused_count: int = 0
    unresolved_count: int = 0
    graveyard_summary: Dict[str, int] = Field(
        default_factory=lambda: {
            "resting": 0,
            "aging": 0,
            "whispering": 0,
            "haunted": 0,
        }
    )
    overall_health_score: int = 100
    ai_summary: Optional[str] = None
    ai_model_used: Optional[str] = None
    is_ai_generated: bool = False
    dependencies: List[Dependency] = Field(default_factory=list)
    findings: List[Finding] = Field(default_factory=list)
    limitations: List[str] = Field(default_factory=list)


class ReportListItem(BaseModel):
    id: str
    project_name: str
    project_path: str
    created_at: str
    total_dependencies: int
    findings_count: int
    haunted_count: int
    overall_health_score: int
