from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class FindingCategory(str, Enum):
    OUTDATED = "outdated"
    INACTIVE = "inactive"
    SECURITY = "security"
    UNUSED = "unused"
    UNRESOLVED = "unresolved"


class Severity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


class GraveyardStatus(str, Enum):
    RESTING = "resting"        # Stable, up to date
    AGING = "aging"            # Behind latest release or stale
    WHISPERING = "whispering"  # Incomplete evidence, unused concern, unknown
    HAUNTED = "haunted"        # Security advisory or confirmed critical concern


class Finding(BaseModel):
    id: str
    package_name: str
    category: FindingCategory
    severity: Severity
    graveyard_status: GraveyardStatus
    title: str
    explanation: str
    evidence: List[str] = Field(default_factory=list)
    evidence_source: str
    confidence: str = "medium"  # high, medium, low
    recommended_action: str
    is_verified: bool = False
    ai_explanation: Optional[str] = None
    advisory_id: Optional[str] = None
    current_version: Optional[str] = None
    target_version: Optional[str] = None
    details: Dict[str, Any] = Field(default_factory=dict)
