from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field


class DependencyType(str, Enum):
    DEPENDENCY = "dependencies"
    DEV_DEPENDENCY = "devDependencies"
    OPTIONAL_DEPENDENCY = "optionalDependencies"
    PEER_DEPENDENCY = "peerDependencies"


class Dependency(BaseModel):
    name: str
    declared_range: str
    installed_version: Optional[str] = None
    dependency_type: DependencyType = DependencyType.DEPENDENCY
    is_direct: bool = True
    manifest_path: str = "package.json"
    is_used_in_source: Optional[bool] = None
    source_reference_count: int = 0
    resolved_registry: Optional[str] = None
    latest_version: Optional[str] = None
    last_published: Optional[str] = None
    homepage: Optional[str] = None
    repository_url: Optional[str] = None
    is_archived: Optional[bool] = None
