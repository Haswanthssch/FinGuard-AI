"""
FastAPI Application Entry Point — Module 7
"""
from __future__ import annotations

import logging
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.api.routes.portfolio import router as portfolio_router
from app.api.routes.ml import router as ml_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)

# Ensure dirs exist
for d in [settings.CACHE_DIR, settings.MODELS_DIR, settings.DATASETS_DIR]:
    os.makedirs(d, exist_ok=True)

app = FastAPI(
    title="Portfolio Risk Intelligence API",
    description="ML-powered Indian portfolio analytics platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(portfolio_router, prefix="/api/v1")
app.include_router(ml_router, prefix="/api/v1")


@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "service": settings.APP_NAME, "version": "1.0.0"}


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy"}


@app.exception_handler(Exception)
async def generic_exception_handler(request, exc):
    logger.error("Unhandled exception: %s", exc, exc_info=True)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})
