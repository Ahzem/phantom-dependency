from pathlib import Path
from app.services.lockfile_service import LockfileService


def test_resolve_sample_lockfile(sample_project_path: Path):
    resolved_map, lock_type = LockfileService.resolve_versions(sample_project_path)
    assert lock_type == "npm"
    assert "chalk" in resolved_map
    assert resolved_map["chalk"] == "4.1.2"
    assert resolved_map.get("lodash") == "3.10.1"
    assert resolved_map.get("minimist") == "0.0.8"
    assert resolved_map.get("moment") == "2.29.4"
