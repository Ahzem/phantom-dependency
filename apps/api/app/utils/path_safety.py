import os
from pathlib import Path
from typing import Set, Tuple
from app.core.exceptions import InvalidProjectPathError, ManifestNotFoundError

# Standard directories and files to exclude for safety and performance
IGNORED_DIRECTORIES: Set[str] = {
    "node_modules",
    ".git",
    ".next",
    ".turbo",
    ".nuxt",
    ".svelte-kit",
    "dist",
    "build",
    "out",
    "coverage",
    ".venv",
    "venv",
    ".cache",
    ".idea",
    ".vscode",
    ".pnpm-store",
}

FORBIDDEN_FILE_PATTERNS: Set[str] = {
    ".env",
    ".env.local",
    ".env.production",
    ".env.development",
    "id_rsa",
    "id_ed25519",
    ".pem",
    ".key",
    "credentials",
    "secrets",
}


def sanitize_and_validate_project_path(raw_path: str) -> Path:
    """
    Validates that raw_path exists, is a directory, contains package.json,
    and is safe to inspect (no escaping outside root).
    """
    if not raw_path or not raw_path.strip():
        raise InvalidProjectPathError("Project path cannot be empty.")

    clean_str = raw_path.strip().strip('"').strip("'")
    try:
        resolved = Path(clean_str).resolve(strict=True)
    except (FileNotFoundError, RuntimeError, PermissionError, OSError) as e:
        raise InvalidProjectPathError(f"Directory does not exist or is inaccessible: {str(e)}")

    if not resolved.is_dir():
        raise InvalidProjectPathError(f"Path is not a directory: {resolved}")

    # Check for package.json
    manifest_path = resolved / "package.json"
    if not manifest_path.exists() or not manifest_path.is_file():
        raise ManifestNotFoundError(f"No package.json found in: {resolved}")

    return resolved


def is_safe_subpath(root: Path, target: Path) -> bool:
    """
    Ensures target is strictly within the root directory and does not escape via symlinks.
    """
    try:
        resolved_root = root.resolve()
        resolved_target = target.resolve()
        # On Windows, path casing and drive letters must match
        return resolved_target == resolved_root or resolved_root in resolved_target.parents
    except (OSError, RuntimeError):
        return False


def is_ignored_directory(dir_name: str) -> bool:
    return dir_name.lower() in IGNORED_DIRECTORIES or dir_name.startswith(".")


def is_sensitive_file(file_name: str) -> bool:
    low = file_name.lower()
    for pattern in FORBIDDEN_FILE_PATTERNS:
        if pattern in low:
            return True
    return False
