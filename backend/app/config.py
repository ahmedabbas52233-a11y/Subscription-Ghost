from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Database — accepts both sync and async URLs; database.py auto-upgrades
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/documind"

    # Security
    SECRET_KEY: str = "change-this-to-a-random-string-min-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # File handling
    MAX_FILE_SIZE: int = 5_242_880  # 5 MB

    # OpenAI
    OPENAI_API_KEY: str = ""

    # CORS — comma-separated list stored as a single string for .env compatibility
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
