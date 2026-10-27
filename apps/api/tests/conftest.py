import sys
from pathlib import Path
import pytest
from httpx import AsyncClient, ASGITransport

# Ensure app is in pythonpath
backend_root = Path(__file__).resolve().parent.parent
if str(backend_root) not in sys.path:
    sys.path.insert(0, str(backend_root))

from app.main import app


@pytest.fixture
def sample_project_path() -> Path:
    monorepo_root = backend_root.parent.parent
    sample = monorepo_root / "examples" / "sample-project"
    return sample


@pytest.fixture
async def async_client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client
