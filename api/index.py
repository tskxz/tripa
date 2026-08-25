"""
Ponto de entrada FastAPI (Tripa AI Backend).
Compativeis com Vercel Serverless Functions (@vercel/python).
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.core.config import settings
from api.v1.router import api_router
from api.core.log_store import install_memory_handler


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup e shutdown da aplicacao."""
    install_memory_handler()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan,
)

# Configuracao de Middleware CORS para desenvolvimento e producao
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusao do router de rotas v1
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
async def root():
    """
    Rota raiz para confirmacao imediata da disponibilidade da API.
    """
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "operational",
        "docs": f"{settings.API_V1_STR}/docs"
    }
