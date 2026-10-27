import re
from typing import Optional, Tuple


def clean_version(raw_version: Optional[str]) -> str:
    """Removes semver prefixes like ^, ~, >=, <=, v, etc."""
    if not raw_version:
        return ""
    # strip git/url/file protocols
    v = raw_version.strip()
    if v.startswith(("git+", "http://", "https://", "file:", "workspace:")):
        return v
    # Remove leading ^, ~, v, =, >, <, >=, <=
    cleaned = re.sub(r"^[v=~^><\s]+", "", v)
    # Split on first dash/plus (e.g. 1.2.3-alpha -> 1.2.3)
    cleaned = cleaned.split("-")[0].split("+")[0]
    return cleaned.strip()


def parse_semver(version_str: str) -> Optional[Tuple[int, int, int]]:
    """Parses major, minor, patch ints from cleaned version."""
    cleaned = clean_version(version_str)
    match = re.match(r"^(\d+)(?:\.(\d+))?(?:\.(\d+))?", cleaned)
    if not match:
        return None
    major = int(match.group(1))
    minor = int(match.group(2)) if match.group(2) is not None else 0
    patch = int(match.group(3)) if match.group(3) is not None else 0
    return (major, minor, patch)


def compare_versions(current_str: str, latest_str: str) -> str:
    """
    Returns diff classification:
    - 'major': current major < latest major
    - 'minor': same major, current minor < latest minor
    - 'patch': same major/minor, current patch < latest patch
    - 'current': current >= latest
    - 'unknown': could not parse
    """
    cur = parse_semver(current_str)
    lat = parse_semver(latest_str)
    if not cur or not lat:
        return "unknown"

    if cur[0] < lat[0]:
        return "major"
    elif cur[0] == lat[0] and cur[1] < lat[1]:
        return "minor"
    elif cur[0] == lat[0] and cur[1] == lat[1] and cur[2] < lat[2]:
        return "patch"
    else:
        return "current"
