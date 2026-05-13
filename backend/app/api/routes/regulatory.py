from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.regulatory import RegulatoryChunk, RegulatoryDocument
from app.models.user import User
from app.services.regulatory_rag_service import regulatory_rag_service

router = APIRouter(prefix="/regulatory", tags=["regulatory-rag"])


class RegulatoryIngestRequest(BaseModel):
    source: str = "seed"
    use_document_intelligence: bool = True
    upload_to_search: bool = True


@router.get("/rag/status")
async def rag_status(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return {
        "documents": db.query(RegulatoryDocument).count(),
        "chunks": db.query(RegulatoryChunk).count(),
        "azure_search_configured": regulatory_rag_service.azure_search_enabled(),
        "document_intelligence_configured": regulatory_rag_service.document_intelligence_enabled(),
        "azure_openai_embeddings_configured": regulatory_rag_service.embeddings_enabled(),
    }


@router.post("/rag/ingest")
async def ingest_regulatory_rag(
    payload: RegulatoryIngestRequest,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    results = {}
    if payload.source in {"seed", "all"}:
        results["seed"] = await regulatory_rag_service.ingest_seed_corpus(
            db,
            use_document_intelligence=payload.use_document_intelligence,
            upload_to_search=payload.upload_to_search,
        )
    if payload.source in {"blob", "all"}:
        results["blob"] = await regulatory_rag_service.ingest_blob_pdfs(
            db,
            upload_to_search=payload.upload_to_search,
        )
    if not results:
        return {"error": "source must be one of: seed, blob, all"}
    return results if len(results) > 1 else next(iter(results.values()))
