import argparse
import asyncio
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT))

from app.core.database import Base, SessionLocal, engine
from app.services.regulatory_rag_service import regulatory_rag_service


async def main() -> None:
    parser = argparse.ArgumentParser(description="Load FinGuard regulatory RAG documents.")
    parser.add_argument(
        "--source",
        choices=["seed", "blob", "all"],
        default="seed",
        help="Use bundled seed corpus, Azure Blob PDFs, or both.",
    )
    parser.add_argument("--use-document-intelligence", action="store_true", help="Use Azure Document Intelligence for seed URLs. Blob PDFs always use Document Intelligence.")
    parser.add_argument("--no-document-intelligence", action="store_true", help="Deprecated alias kept for compatibility; seed mode skips Document Intelligence by default.")
    parser.add_argument("--no-search-upload", action="store_true", help="Store chunks locally without uploading to Azure AI Search.")
    args = parser.parse_args()

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        results = {}
        if args.source in {"seed", "all"}:
            results["seed"] = await regulatory_rag_service.ingest_seed_corpus(
                db,
                use_document_intelligence=args.use_document_intelligence and not args.no_document_intelligence,
                upload_to_search=not args.no_search_upload,
            )
        if args.source in {"blob", "all"}:
            results["blob"] = await regulatory_rag_service.ingest_blob_pdfs(
                db,
                upload_to_search=not args.no_search_upload,
            )
    finally:
        db.close()

    print(results if len(results) > 1 else next(iter(results.values())))


if __name__ == "__main__":
    asyncio.run(main())
