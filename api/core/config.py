"""
Configuracoes e utilitarios centrais da aplicacao.
"""
from typing import List
import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Configuracoes globais do sistema Tripa AI.
    """
    PROJECT_NAME: str = "Tripa AI"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    APP_ENV: str = "development"

    # Chaves de APIs externas (opcionais no setup inicial)
    GROQ_API_KEY: str | None = None
    TAVILY_API_KEY: str | None = None
    KIWI_API_KEY: str | None = None

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://*.vercel.app"
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
