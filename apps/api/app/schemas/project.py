from typing import Optional
from pydantic import BaseModel, Field


class ProjectValidateRequest(BaseModel):
    project_path: str = Field(..., description="Absolute or relative path to project root")


class ProjectValidateResponse(BaseModel):
    is_valid: bool
    project_path: str
    project_name: Optional[str] = None
    project_version: Optional[str] = None
    has_lockfile: bool = False
    lockfile_type: Optional[str] = None
    error: Optional[str] = None


class ProjectScanRequest(BaseModel):
    project_path: str
    enable_enrichment: bool = False
    enable_ai: bool = True
