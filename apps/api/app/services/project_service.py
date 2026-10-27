import json
from pathlib import Path
from typing import Optional, Tuple
from app.utils.path_safety import sanitize_and_validate_project_path
from app.schemas.project import ProjectValidateResponse
from app.core.exceptions import ManifestParseError, InvalidProjectPathError


class ProjectService:
    @staticmethod
    def detect_lockfile(project_root: Path) -> Tuple[bool, Optional[str]]:
        if (project_root / "package-lock.json").exists():
            return True, "npm"
        if (project_root / "pnpm-lock.yaml").exists():
            return True, "pnpm"
        if (project_root / "yarn.lock").exists():
            return True, "yarn"
        return False, None

    @classmethod
    def validate_project(cls, raw_path: str) -> ProjectValidateResponse:
        try:
            root = sanitize_and_validate_project_path(raw_path)
            manifest_file = root / "package.json"
            
            try:
                with open(manifest_file, "r", encoding="utf-8") as f:
                    manifest_data = json.load(f)
            except Exception as e:
                return ProjectValidateResponse(
                    is_valid=False,
                    project_path=str(root),
                    error=f"Malformed package.json: {str(e)}",
                )

            name = manifest_data.get("name") or root.name
            version = manifest_data.get("version")
            has_lock, lock_type = cls.detect_lockfile(root)

            return ProjectValidateResponse(
                is_valid=True,
                project_path=str(root),
                project_name=name,
                project_version=version,
                has_lockfile=has_lock,
                lockfile_type=lock_type,
            )
        except Exception as e:
            return ProjectValidateResponse(
                is_valid=False,
                project_path=raw_path,
                error=str(e),
            )
