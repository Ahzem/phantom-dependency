from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import get_settings
from app.core.logging import logger
from app.core.exceptions import PhantomException
from app.api.router import api_router

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Phantom Dependency — Local-first AI-powered dependency investigation tool (Ghost in the Machine)",
)

# CORS setup restricted to local frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global error handlers
@app.exception_handler(PhantomException)
async def phantom_exception_handler(request: Request, exc: PhantomException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "type": exc.__class__.__name__},
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled error processing {request.method} {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal phantom error occurred", "type": "InternalServerError"},
    )


# Mount router
app.include_router(api_router)


@app.get("/")
async def root():
    return {
        "message": "Phantom Dependency API is lurking...",
        "version": settings.app_version,
        "docs": "/docs",
    }
