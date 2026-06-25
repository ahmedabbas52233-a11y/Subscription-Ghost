from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.routers.auth import router as auth_router
from app.routers.upload import router as upload_router
from app.routers.analyze import router as analyze_router
from app.routers.history import router as history_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Run DB migrations on startup."""
    await init_db()
    yield


app = FastAPI(
    title="DocuMind AI",
    description="Intelligent Document Analyzer API",
    version="2.0.0",
    lifespan=lifespan,
)

# -----------------------------------------------------------------------
# IMPORTANT: Add CORS middleware BEFORE including routers.
# FastAPI processes middleware in reverse-registration order; adding it
# after the routers means preflight OPTIONS requests hit the route layer
# first, which raises 405 Method Not Allowed before CORS headers are set.
# -----------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1/auth")
app.include_router(upload_router, prefix="/api/v1")
app.include_router(analyze_router, prefix="/api/v1")
app.include_router(history_router, prefix="/api/v1")


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy", "service": "documind-ai", "version": "2.0.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
