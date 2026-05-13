"""
FastAPI Portfolio Routes — Module 7
POST /upload-portfolio  POST /analyze  GET /portfolio-metrics
"""
from __future__ import annotations

import logging
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Any, Optional

from app.services.portfolio_service import process_portfolio
from app.ingestion.parser import IngestionError
from app.utils.json_utils import clean_for_json

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/portfolio", tags=["Portfolio"])


class AnalyzeRequest(BaseModel):
    holdings: list[dict]
    filename: Optional[str] = "portfolio.csv"


@router.post("/upload-portfolio")
async def upload_portfolio(file: UploadFile = File(...)) -> JSONResponse:
    """
    Upload XLSX or CSV broker holdings statement.
    Returns full analytics + ML output.
    """
    if not file.filename:
        raise HTTPException(400, "No filename provided")

    ext = file.filename.rsplit(".", 1)[-1].lower()
    if ext not in ("xlsx", "xls", "csv"):
        raise HTTPException(400, f"Unsupported file type: {ext}. Use XLSX or CSV.")

    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(400, "Uploaded file is empty.")

    try:
        result = process_portfolio(contents, file.filename)
    except IngestionError as e:
        raise HTTPException(422, detail=str(e))
    except Exception as e:
        logger.exception("Unexpected error during portfolio processing")
        raise HTTPException(500, detail=f"Processing error: {str(e)}")

    return JSONResponse(content=clean_for_json(result))


@router.get("/portfolio-metrics/{session_id}")
async def get_portfolio_metrics(session_id: str) -> JSONResponse:
    """Retrieve cached metrics for a session (stub — use DB in production)."""
    raise HTTPException(501, "Persistent session retrieval requires DB integration.")
