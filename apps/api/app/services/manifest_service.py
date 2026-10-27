import json
from pathlib import Path
from typing import Dict, List, Optional
from app.schemas.dependency import Dependency, DependencyType
from app.core.exceptions import ManifestNotFoundError, ManifestParseError
from app.core.logging import logger


class ManifestService:
    @staticmethod
    def parse_manifest(project_root: Path) -> List[Dependency]:
        manifest_path = project_root / "package.json"
        if not manifest_path.exists():
            raise ManifestNotFoundError(f"Missing package.json in {project_root}")

        try:
            with open(manifest_path, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception as e:
            raise ManifestParseError(f"Failed to parse package.json: {str(e)}")

        dependencies: List[Dependency] = []
        seen = set()

        category_mapping = [
            ("dependencies", DependencyType.DEPENDENCY),
            ("devDependencies", DependencyType.DEV_DEPENDENCY),
            ("optionalDependencies", DependencyType.OPTIONAL_DEPENDENCY),
            ("peerDependencies", DependencyType.PEER_DEPENDENCY),
        ]

        for section_key, dep_type in category_mapping:
            section = data.get(section_key, {})
            if not isinstance(section, dict):
                logger.warning(f"Manifest section {section_key} is not a dictionary. Skipping.")
                continue

            for pkg_name, raw_range in section.items():
                if not pkg_name or not isinstance(pkg_name, str):
                    continue

                if not isinstance(raw_range, str):
                    raw_range = str(raw_range)

                # Avoid duplicate names across sections (prefer dependencies > devDependencies)
                if pkg_name in seen:
                    continue
                seen.add(pkg_name)

                # Check if it's a workspace or local package
                dep = Dependency(
                    name=pkg_name,
                    declared_range=raw_range,
                    dependency_type=dep_type,
                    is_direct=True,
                    manifest_path="package.json",
                )
                dependencies.append(dep)

        return dependencies
