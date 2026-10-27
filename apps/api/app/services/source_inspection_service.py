import json
import re
from pathlib import Path
from typing import Dict, List, Set
from app.utils.path_safety import is_ignored_directory, is_sensitive_file
from app.core.logging import logger

SOURCE_EXTENSIONS: Set[str] = {
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".mjs",
    ".cjs",
    ".vue",
    ".svelte",
    ".css",
    ".scss",
    ".less",
    ".html",
}

# Known tools commonly invoked via scripts or config files rather than source imports
KNOWN_BUILD_TOOLS: Set[str] = {
    "typescript",
    "eslint",
    "prettier",
    "tailwindcss",
    "postcss",
    "autoprefixer",
    "vite",
    "webpack",
    "babel",
    "jest",
    "vitest",
    "turbo",
    "tsup",
    "rimraf",
    "cross-env",
    "nodemon",
    "tsx",
    "concurrently",
    "husky",
    "lint-staged",
    "@types/node",
}


class SourceInspectionService:
    @classmethod
    def inspect_usage(cls, project_root: Path, dependencies: List[str]) -> Dict[str, Dict]:
        """
        Scans source files and configurations conservatively.
        Returns map: {
            package_name: {
                "is_used": bool,
                "references_count": int,
                "locations": List[str],
                "exception_reason": Optional[str]
            }
        }
        """
        results: Dict[str, Dict] = {
            pkg: {
                "is_used": False,
                "references_count": 0,
                "locations": [],
                "exception_reason": None,
            }
            for pkg in dependencies
        }

        # 1. Check package.json scripts and configs
        cls._check_manifest_exceptions(project_root, results)

        # 2. Check root configuration files
        cls._check_config_files(project_root, results)

        # 3. Compile regex matchers for each package
        patterns = cls._build_package_patterns(dependencies)

        # 4. Walk source files
        source_files = cls._collect_source_files(project_root)
        for filepath in source_files:
            rel_path = filepath.relative_to(project_root).as_posix()
            try:
                content = filepath.read_text(encoding="utf-8", errors="ignore")
            except Exception as e:
                logger.debug(f"Could not read {filepath}: {e}")
                continue

            for pkg_name, pattern in patterns.items():
                matches = pattern.findall(content)
                if matches:
                    results[pkg_name]["is_used"] = True
                    results[pkg_name]["references_count"] += len(matches)
                    if len(results[pkg_name]["locations"]) < 5:
                        results[pkg_name]["locations"].append(rel_path)

        # 5. Apply known build tools whitelist
        for pkg_name in dependencies:
            base_name = pkg_name.split("/")[0] if pkg_name.startswith("@types/") else pkg_name
            if pkg_name.startswith("@types/") or pkg_name in KNOWN_BUILD_TOOLS or base_name in KNOWN_BUILD_TOOLS:
                if not results[pkg_name]["is_used"]:
                    results[pkg_name]["is_used"] = True
                    results[pkg_name]["exception_reason"] = "Standard build, type definition, or development tooling."

        return results

    @staticmethod
    def _collect_source_files(project_root: Path, max_files: int = 1500) -> List[Path]:
        files: List[Path] = []
        try:
            for root, dirs, filenames in project_root.walk():
                # Filter out ignored directories in-place to prune walk
                dirs[:] = [d for d in dirs if not is_ignored_directory(d)]

                for fn in filenames:
                    if is_sensitive_file(fn):
                        continue
                    ext = Path(fn).suffix.lower()
                    if ext in SOURCE_EXTENSIONS:
                        files.append(root / fn)
                        if len(files) >= max_files:
                            logger.info(f"Source file limit reached ({max_files})")
                            return files
        except Exception as e:
            logger.warning(f"Error walking source files: {e}")

        return files

    @staticmethod
    def _build_package_patterns(dependencies: List[str]) -> Dict[str, re.Pattern]:
        patterns: Dict[str, re.Pattern] = {}
        for pkg in dependencies:
            escaped = re.escape(pkg)
            # Match:
            # - import ... from 'pkg' or "pkg" or 'pkg/subpath'
            # - require('pkg')
            # - import('pkg')
            # - @import 'pkg'
            # - from 'pkg'
            regex_str = (
                rf"(?:import\s+(?:(?:[\w*\s{{}},]*)\s+from\s+)?|require\s*\(\s*|import\s*\(\s*|@import\s+)['\"]{escaped}(?:/[^'\"]+)?['\"]"
            )
            patterns[pkg] = re.compile(regex_str, re.MULTILINE)
        return patterns

    @staticmethod
    def _check_manifest_exceptions(project_root: Path, results: Dict[str, Dict]):
        manifest_path = project_root / "package.json"
        if not manifest_path.exists():
            return
        try:
            with open(manifest_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            scripts = data.get("scripts", {})
            if isinstance(scripts, dict):
                script_text = " ".join(str(v) for v in scripts.values())
                for pkg in results.keys():
                    # check if package binary is invoked in scripts (e.g., "prettier --write")
                    token = pkg.split("/")[-1]
                    if re.search(rf"\b{re.escape(token)}\b", script_text):
                        results[pkg]["is_used"] = True
                        results[pkg]["exception_reason"] = f"Invoked via package.json script"
                        results[pkg]["locations"].append("package.json (scripts)")
        except Exception as e:
            logger.debug(f"Error checking manifest scripts: {e}")

    @staticmethod
    def _check_config_files(project_root: Path, results: Dict[str, Dict]):
        config_patterns = [
            "tailwind.config.*",
            "postcss.config.*",
            "vite.config.*",
            "next.config.*",
            "webpack.config.*",
            ".eslintrc*",
            "eslint.config.*",
            "prettier.config.*",
            ".prettierrc*",
            "tsconfig.json",
        ]
        for pattern in config_patterns:
            for conf_file in project_root.glob(pattern):
                if conf_file.is_file():
                    try:
                        content = conf_file.read_text(encoding="utf-8", errors="ignore")
                        for pkg in results.keys():
                            if pkg in content:
                                results[pkg]["is_used"] = True
                                results[pkg]["exception_reason"] = f"Referenced in configuration file {conf_file.name}"
                                results[pkg]["locations"].append(conf_file.name)
                    except Exception:
                        pass
