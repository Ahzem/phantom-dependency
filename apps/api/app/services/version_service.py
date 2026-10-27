import asyncio
from datetime import datetime, timezone
from typing import Dict, List, Optional
import httpx
from app.core.config import get_settings
from app.core.logging import logger
from app.utils.version_utils import clean_version, compare_versions


class VersionService:
    def __init__(self):
        self.settings = get_settings()

    async def fetch_registry_metadata(
        self, package_names: List[str], client: Optional[httpx.AsyncClient] = None
    ) -> Dict[str, Dict]:
        """
        Queries npm registry for latest versions and release dates.
        Only called when network enrichment is enabled.
        """
        if not self.settings.enable_network_enrichment and not client:
            return {}

        results: Dict[str, Dict] = {}
        should_close = False
        if not client:
            client = httpx.AsyncClient(timeout=self.settings.request_timeout_seconds)
            should_close = True

        async def fetch_one(pkg: str):
            # Encode scoped packages, e.g., @types/node -> @types%2Fnode
            safe_pkg = pkg.replace("/", "%2F")
            url = f"{self.settings.npm_registry_url.rstrip('/')}/{safe_pkg}"
            try:
                resp = await client.get(url)
                if resp.status_code == 200:
                    data = resp.json()
                    dist_tags = data.get("dist-tags", {})
                    latest = dist_tags.get("latest")
                    time_data = data.get("time", {})
                    last_published = time_data.get(latest) if latest else None
                    if not last_published and time_data:
                        # Grab the most recent timestamp in time dict
                        last_published = time_data.get("modified")

                    repo = data.get("repository", {})
                    repo_url = repo.get("url") if isinstance(repo, dict) else str(repo)

                    results[pkg] = {
                        "latest_version": latest,
                        "last_published": last_published,
                        "homepage": data.get("homepage"),
                        "repository_url": repo_url,
                        "is_valid": True,
                    }
                elif resp.status_code == 404:
                    results[pkg] = {
                        "is_valid": False,
                        "error": "Package not found on public registry",
                    }
            except Exception as e:
                logger.debug(f"Failed to fetch metadata for {pkg}: {e}")
                results[pkg] = {"is_valid": False, "error": str(e)}

        try:
            # Run in batches of 10 to respect rate limits
            batch_size = 10
            for i in range(0, len(package_names), batch_size):
                batch = package_names[i : i + batch_size]
                await asyncio.gather(*(fetch_one(p) for p in batch))
        finally:
            if should_close:
                await client.aclose()

        return results

    @staticmethod
    def calculate_age_months(iso_timestamp: Optional[str]) -> Optional[int]:
        if not iso_timestamp:
            return None
        try:
            # Handle ISO string e.g. 2021-03-22T10:00:00.000Z
            clean_ts = iso_timestamp.replace("Z", "+00:00")
            dt = datetime.fromisoformat(clean_ts)
            now = datetime.now(timezone.utc)
            delta_days = (now - dt).days
            return max(0, delta_days // 30)
        except Exception:
            return None
