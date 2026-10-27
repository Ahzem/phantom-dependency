from pathlib import Path
from app.services.manifest_service import ManifestService
from app.schemas.dependency import DependencyType


def test_parse_sample_manifest(sample_project_path: Path):
    deps = ManifestService.parse_manifest(sample_project_path)
    assert len(deps) >= 5

    names = {d.name: d for d in deps}
    assert "chalk" in names
    assert names["chalk"].dependency_type == DependencyType.DEPENDENCY
    assert names["chalk"].declared_range == "^4.1.2"

    assert "prettier" in names
    assert names["prettier"].dependency_type == DependencyType.DEV_DEPENDENCY

    assert "lodash" in names
    assert "minimist" in names
    assert "moment" in names
