import json
import re
from pathlib import Path
from typing import Dict, Optional, Tuple
from app.core.logging import logger


class LockfileService:
    @classmethod
    def resolve_versions(cls, project_root: Path) -> Tuple[Dict[str, str], Optional[str]]:
        """
        Attempts to read lockfile in project_root.
        Returns a map of { package_name: resolved_version } and lockfile_type or None.
        """
        npm_lock = project_root / "package-lock.json"
        if npm_lock.exists():
            return cls._parse_npm_lock(npm_lock), "npm"

        yarn_lock = project_root / "yarn.lock"
        if yarn_lock.exists():
            return cls._parse_yarn_lock(yarn_lock), "yarn"

        pnpm_lock = project_root / "pnpm-lock.yaml"
        if pnpm_lock.exists():
            return cls._parse_pnpm_lock(pnpm_lock), "pnpm"

        return {}, None

    @staticmethod
    def _parse_npm_lock(lock_path: Path) -> Dict[str, str]:
        resolved: Dict[str, str] = {}
        try:
            with open(lock_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            # lockfileVersion 2 or 3 (packages dictionary)
            packages = data.get("packages", {})
            if packages and isinstance(packages, dict):
                for pkg_path, meta in packages.items():
                    if not pkg_path or not isinstance(meta, dict):
                        continue
                    # node_modules/lodash or node_modules/@scope/pkg
                    if pkg_path.startswith("node_modules/"):
                        name = pkg_path[len("node_modules/"):]
                        # Ignore nested (e.g. node_modules/a/node_modules/b) for top-level direct
                        if "node_modules/" not in name:
                            version = meta.get("version")
                            if version and name not in resolved:
                                resolved[name] = str(version)

            # lockfileVersion 1 (dependencies dictionary)
            dependencies = data.get("dependencies", {})
            if dependencies and isinstance(dependencies, dict):
                for name, meta in dependencies.items():
                    if isinstance(meta, dict) and "version" in meta:
                        if name not in resolved:
                            resolved[name] = str(meta["version"])

        except Exception as e:
            logger.warning(f"Error parsing npm lockfile {lock_path}: {e}")

        return resolved

    @staticmethod
    def _parse_yarn_lock(lock_path: Path) -> Dict[str, str]:
        """
        Simple, robust parser for yarn.lock v1 format:
        "lodash@^3.10.1":
          version "3.10.1"
        """
        resolved: Dict[str, str] = {}
        try:
            with open(lock_path, "r", encoding="utf-8") as f:
                current_packages = []
                for line in f:
                    line = line.rstrip()
                    if not line or line.startswith("#"):
                        continue
                    if not line.startswith(" ") and not line.startswith("\t"):
                        # Package header line like "chalk@^4.1.2", "@types/node@*":
                        header = line.strip().rstrip(":")
                        # Split multiple headers
                        parts = [p.strip().strip('"').strip("'") for p in header.split(",")]
                        current_packages = []
                        for p in parts:
                            # Extract package name (handles scoped packages like @babel/core@^7.0)
                            match = re.match(r"^(@?[^@]+)@", p)
                            if match:
                                current_packages.append(match.group(1))
                    else:
                        # Indented property line
                        stripped = line.strip()
                        if stripped.startswith("version ") and current_packages:
                            version_val = stripped.split("version ", 1)[1].strip().strip('"').strip("'")
                            for pkg_name in current_packages:
                                if pkg_name not in resolved:
                                    resolved[pkg_name] = version_val
                            current_packages = []
        except Exception as e:
            logger.warning(f"Error parsing yarn lockfile {lock_path}: {e}")

        return resolved

    @staticmethod
    def _parse_pnpm_lock(lock_path: Path) -> Dict[str, str]:
        """
        Parses pnpm-lock.yaml packages / importers blocks
        """
        resolved: Dict[str, str] = {}
        try:
            with open(lock_path, "r", encoding="utf-8") as f:
                content = f.read()
                # Match lines like: /lodash@3.10.1 or 'lodash@3.10.1': or /@scope/pkg@1.2.3:
                matches = re.findall(r"['\"]?/(@?[^@\s:]+)@([^':\s()]+)['\"]?:", content)
                for name, ver in matches:
                    if name not in resolved:
                        resolved[name] = ver
        except Exception as e:
            logger.warning(f"Error parsing pnpm lockfile {lock_path}: {e}")

        return resolved
