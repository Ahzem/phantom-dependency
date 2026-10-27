from app.utils.version_utils import clean_version, parse_semver, compare_versions


def test_clean_version():
    assert clean_version("^1.2.3") == "1.2.3"
    assert clean_version("~2.0.0-beta.1") == "2.0.0"
    assert clean_version(">=3.4.5") == "3.4.5"
    assert clean_version("v4.5.6") == "4.5.6"
    assert clean_version("workspace:*") == "workspace:*"


def test_parse_semver():
    assert parse_semver("1.2.3") == (1, 2, 3)
    assert parse_semver("^2.5") == (2, 5, 0)
    assert parse_semver("invalid") is None


def test_compare_versions():
    assert compare_versions("1.0.0", "2.0.0") == "major"
    assert compare_versions("1.2.0", "1.3.0") == "minor"
    assert compare_versions("1.2.3", "1.2.4") == "patch"
    assert compare_versions("2.0.0", "2.0.0") == "current"
    assert compare_versions("2.1.0", "2.0.0") == "current"
