from typing import Any, Dict, Optional
from fastapi import HTTPException, status


class PhantomException(HTTPException):
    def __init__(
        self,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        detail: str = "A phantom error occurred",
        headers: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(status_code=status_code, detail=detail, headers=headers)


class InvalidProjectPathError(PhantomException):
    def __init__(self, detail: str = "Invalid or inaccessible project path"):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


class ManifestNotFoundError(PhantomException):
    def __init__(self, detail: str = "No package.json found in project directory"):
        code = getattr(status, "HTTP_422_UNPROCESSABLE_CONTENT", 422)
        super().__init__(status_code=code, detail=detail)


class ManifestParseError(PhantomException):
    def __init__(self, detail: str = "Failed to parse package.json"):
        code = getattr(status, "HTTP_422_UNPROCESSABLE_CONTENT", 422)
        super().__init__(status_code=code, detail=detail)


class AIInferenceError(PhantomException):
    def __init__(self, detail: str = "Local AI inference failed or timed out"):
        super().__init__(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=detail)


class ReportNotFoundError(PhantomException):
    def __init__(self, detail: str = "Report not found"):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)
