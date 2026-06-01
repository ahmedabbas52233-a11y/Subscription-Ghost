from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.config import settings

# Auto-upgrade sync postgres URLs to asyncpg so plain postgresql:// in .env still works
_url = settings.DATABASE_URL
if _url.startswith("postgresql://") and not _url.startswith("postgresql+asyncpg://"):
    _url = _url.replace("postgresql://", "postgresql+asyncpg://", 1)

engine = create_async_engine(_url, echo=False, pool_pre_ping=True)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()


async def get_db():
    """FastAPI dependency that yields a DB session and ensures it is closed."""
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    """Create all tables on startup (dev convenience; use Alembic in production)."""
    # Import models here so Base.metadata is populated before create_all
    __import__("app.models.user")
    __import__("app.models.document")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
