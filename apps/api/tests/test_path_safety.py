from pathlib import Path
import pytest
from app.utils.path_safety import (
    sanitize_and_validate_project_path,
    is_safe_subpath,
    is_ignored_directory,
    is_sensitive_file,
)
from app.core.exceptions import InvalidProjectPathError, ManifestNotFoundError


def test_sanitize_valid_path(sample_project_path: Path):
    validated = sanitize_and_validate_project_path(str(sample_project_path))
    assert validated.exists()
    assert (validated / "package.json").exists()


def test_sanitize_nonexistent_path(tmp_path: Path):
    bad_path = tmp_path / "does-not-exist"
    with pytest.raises(InvalidProjectPathError):
        sanitize_and_validate_project_path(str(bad_path))


def test_sanitize_missing_manifest(tmp_path: Path):
    # Directory exists but has no package.json
    with pytest.raises(ManifestNotFoundError):
        sanitize_and_validate_project_path(str(tmp_path))


def test_is_safe_subpath(tmp_path: Path):
    sub = tmp_path / "subfolder" / "file.js"
    assert is_safe_subpath(tmp_path, sub)

    outside = Path("C:/Windows/System32")
    assert not is_safe_subpath(tmp_path, outside)


def test_ignored_directory_and_sensitive_file():
    assert is_ignored_directory("node_modules")
    assert is_ignored_directory(".git")
    assert is_ignored_directory(".next")
    assert not is_ignored_directory("src")

    assert is_sensitive_file(".env")
    assert is_sensitive_file(".env.local")
    assert is_sensitive_file("id_rsa")
    assert not is_sensitive_file("index.js")
