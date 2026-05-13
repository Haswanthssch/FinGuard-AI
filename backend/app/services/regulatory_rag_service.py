import asyncio
import hashlib
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import httpx
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.logging import get_logger
from app.models.regulatory import RegulatoryChunk, RegulatoryDocument
from app.schemas.aihub import AIHubChatResponse, AgentContribution
from app.services.blob_storage_service import BlobPdf, blob_storage_service
from app.services.groq_service import groq_service

logger = get_logger(__name__)

RAG_DOCUMENTS_DIR = Path(__file__).resolve().parents[2] / "rag_documents"
SEED_CORPUS_PATH = RAG_DOCUMENTS_DIR / "regulatory_seed_corpus.json"


@dataclass
class RagHit:
    content: str
    title: str
    regulator: str
    category: str
    source_url: str
    published_date: str | None = None
    section_heading: str | None = None
    score: float = 0.0

    def citation(self) -> dict[str, Any]:
        return {
            "title": self.title,
            "regulator": self.regulator,
            "category": self.category,
            "source_url": self.source_url,
            "published_date": self.published_date,
            "section_heading": self.section_heading,
            "score": round(self.score, 4),
        }


class RegulatoryRagService:
    def __init__(self) -> None:
        self._embedding_failure: str | None = None
        self._search_fields: set[str] | None = None

    def azure_search_enabled(self) -> bool:
        return bool(settings.AZURE_SEARCH_ENDPOINT and settings.AZURE_SEARCH_ADMIN_KEY)

    def document_intelligence_enabled(self) -> bool:
        return bool(settings.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT and settings.AZURE_DOCUMENT_INTELLIGENCE_KEY)

    def embeddings_enabled(self) -> bool:
        return bool(
            not self._embedding_failure
            and settings.AZURE_OPENAI_ENDPOINT
            and settings.AZURE_OPENAI_API_KEY
            and settings.AZURE_OPENAI_EMBEDDING_DEPLOYMENT
        )

    def load_seed_corpus(self) -> list[dict[str, Any]]:
        with SEED_CORPUS_PATH.open("r", encoding="utf-8") as handle:
            return json.load(handle)

    async def retrieve(self, query: str, db: Session, top_k: int | None = None) -> dict[str, Any]:
        limit = top_k or settings.RAG_TOP_K
        hits: list[RagHit] = []
        source = "local-rag"

        if self.azure_search_enabled():
            try:
                hits = await self._search_azure(query, limit)
                source = "azure-ai-search"
            except Exception as exc:
                logger.warning("azure_search_failed fallback=local-rag error=%s", exc)

        if not hits:
            hits = self._search_local(query, db, limit)

        if not hits:
            await self.ingest_seed_corpus(db, use_document_intelligence=False, upload_to_search=False)
            hits = self._search_local(query, db, limit)

        return {
            "context": self._format_context(hits),
            "citations": [hit.citation() for hit in hits],
            "retrieval_source": source if hits else "none",
        }

    async def answer(self, query: str, db: Session, session_id: str) -> AIHubChatResponse:
        rag = await self.retrieve(query, db)
        citations = rag["citations"]
        fallback = self._deterministic_answer(query, rag["context"], citations)
        if not citations or self._is_beginner_query(query):
            llm_source = "deterministic"
            response = fallback
            contribution = AgentContribution(
                agent="regulatory_rag",
                summary="Answered using the regulatory RAG knowledge base.",
                insights=[
                    f"Retrieved {len(citations)} regulatory source chunk(s).",
                    f"Retrieval source: {rag['retrieval_source']}.",
                ],
                recommendations=["Verify final compliance decisions against the linked official regulator source."],
                risk_observations=[],
                confidence=0.82 if citations else 0.45,
                raw_output=response,
            )
            return AIHubChatResponse(
                session_id=session_id,
                response=response,
                summary="Answered by Regulatory RAG.",
                insights=contribution.insights,
                recommendations=contribution.recommendations,
                risk_observations=[],
                confidence_notes=[
                    f"RAG retrieval source: {rag['retrieval_source']}.",
                    "This is informational guidance, not legal or financial advice.",
                ],
                agents_used=["regulatory_rag"],
                contributions=[contribution],
                llm_source=llm_source,
                skills_used=["regulatory_rag", rag["retrieval_source"]],
                citations=citations,
            )

        system_prompt = (
            "You are FinGuard Regulatory AI for Indian financial regulations. "
            "Answer only from the supplied regulatory RAG context. "
            "Do not discuss the user's portfolio unless the question explicitly asks for portfolio suitability. "
            "Be concise, practical, and include a short verification disclaimer. "
            "If context is insufficient, say what is missing and point to the official source."
        )
        user_prompt = json.dumps(
            {
                "question": query,
                "rag_context": rag["context"],
                "citations": citations,
                "answer_format": [
                    "Direct answer",
                    "How it works",
                    "What users/entities should do",
                    "Sources",
                ],
            },
            default=str,
        )
        response, llm_source = await groq_service.complete_or_fallback(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            fallback=fallback,
            temperature=0.15,
            max_tokens=1200,
        )
        contribution = AgentContribution(
            agent="regulatory_rag",
            summary="Answered using the regulatory RAG knowledge base.",
            insights=[
                f"Retrieved {len(citations)} regulatory source chunk(s).",
                f"Retrieval source: {rag['retrieval_source']}.",
            ],
            recommendations=["Verify final compliance decisions against the linked official regulator source."],
            risk_observations=[],
            confidence=0.82 if citations else 0.45,
            raw_output=response,
        )
        return AIHubChatResponse(
            session_id=session_id,
            response=response,
            summary="Answered by Regulatory RAG.",
            insights=contribution.insights,
            recommendations=contribution.recommendations,
            risk_observations=[],
            confidence_notes=[
                f"RAG retrieval source: {rag['retrieval_source']}.",
                "This is informational guidance, not legal or financial advice.",
            ],
            agents_used=["regulatory_rag"],
            contributions=[contribution],
            llm_source=llm_source,
            skills_used=["regulatory_rag", rag["retrieval_source"]],
            citations=citations,
        )

    async def ingest_seed_corpus(
        self,
        db: Session,
        use_document_intelligence: bool = True,
        upload_to_search: bool = True,
    ) -> dict[str, Any]:
        seed_documents = self.load_seed_corpus()
        indexed_documents: list[dict[str, Any]] = []
        search_documents: list[dict[str, Any]] = []

        if upload_to_search and self.azure_search_enabled():
            await self.ensure_search_index()

        for seed in seed_documents:
            content = seed["content"]
            if use_document_intelligence and self.document_intelligence_enabled():
                try:
                    extracted = await self.analyze_url_with_document_intelligence(seed["source_url"])
                    content = extracted or content
                except Exception as exc:
                    logger.warning("document_intelligence_failed source=%s error=%s", seed["source_url"], exc)

            document = self._upsert_document(db, seed)
            self._replace_chunks(db, document)
            chunks = self._chunk_content(content)
            for index, chunk in enumerate(chunks):
                embedding = await self.safe_embed_text(chunk) if upload_to_search else None
                search_document_id = f"{seed['document_id']}-{index}"
                db.add(
                    RegulatoryChunk(
                        document_id=document.id,
                        chunk_index=index,
                        section_heading=self._extract_heading(chunk),
                        content=chunk,
                        search_document_id=search_document_id,
                        embedding=embedding,
                    )
                )
                search_documents.append(self._search_document(seed, search_document_id, index, chunk, embedding))

            indexed_documents.append({"title": seed["title"], "chunks": len(chunks)})

        db.commit()

        uploaded = 0
        if upload_to_search and self.azure_search_enabled() and search_documents:
            uploaded = await self.upload_to_search(search_documents)

        return {
            "documents_loaded": len(indexed_documents),
            "chunks_loaded": sum(item["chunks"] for item in indexed_documents),
            "chunks_uploaded_to_search": uploaded,
            "document_intelligence_used": use_document_intelligence and self.document_intelligence_enabled(),
            "azure_search_used": upload_to_search and self.azure_search_enabled(),
            "embedding_used": upload_to_search and self.embeddings_enabled(),
            "embedding_warning": self._embedding_failure,
            "documents": indexed_documents,
        }

    async def ingest_blob_pdfs(
        self,
        db: Session,
        upload_to_search: bool = True,
    ) -> dict[str, Any]:
        if not blob_storage_service.configured():
            raise RuntimeError("AZURE_BLOB_CONTAINER_URL is required for blob PDF ingestion")
        if not self.document_intelligence_enabled():
            raise RuntimeError("Azure Document Intelligence is required to ingest PDFs from Blob Storage")

        pdfs = await blob_storage_service.list_pdfs()
        indexed_documents: list[dict[str, Any]] = []
        search_documents: list[dict[str, Any]] = []

        if upload_to_search and self.azure_search_enabled():
            await self.ensure_search_index()

        for pdf in pdfs:
            await asyncio.sleep(5)
            extracted = await self.analyze_url_with_document_intelligence(pdf.url)
            seed = self._blob_seed(pdf, extracted)
            document = self._upsert_document(db, seed)
            self._replace_chunks(db, document)
            chunks = self._chunk_content(extracted)

            for index, chunk in enumerate(chunks):
                embedding = await self.safe_embed_text(chunk) if upload_to_search else None
                search_document_id = f"{seed['document_id']}-{index}"
                db.add(
                    RegulatoryChunk(
                        document_id=document.id,
                        chunk_index=index,
                        section_heading=self._extract_heading(chunk),
                        content=chunk,
                        search_document_id=search_document_id,
                        embedding=embedding,
                    )
                )
                search_documents.append(self._search_document(seed, search_document_id, index, chunk, embedding))

            indexed_documents.append({"title": seed["title"], "blob_name": pdf.name, "chunks": len(chunks)})

        db.commit()

        uploaded = 0
        if upload_to_search and self.azure_search_enabled() and search_documents:
            uploaded = await self.upload_to_search(search_documents)

        return {
            "source": "azure-blob-storage",
            "documents_found": len(pdfs),
            "documents_loaded": len(indexed_documents),
            "chunks_loaded": sum(item["chunks"] for item in indexed_documents),
            "chunks_uploaded_to_search": uploaded,
            "document_intelligence_used": True,
            "azure_search_used": upload_to_search and self.azure_search_enabled(),
            "embedding_used": upload_to_search and self.embeddings_enabled(),
            "embedding_warning": self._embedding_failure,
            "documents": indexed_documents,
        }

    async def analyze_url_with_document_intelligence(self, source_url: str) -> str:
        endpoint = settings.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT.strip().rstrip("/")
        api_version = settings.AZURE_DOCUMENT_INTELLIGENCE_API_VERSION
        analyze_url = (
            f"{endpoint}/documentintelligence/documentModels/prebuilt-layout:analyze"
            f"?api-version={api_version}&outputContentFormat=markdown"
        )
        headers = {
            "Ocp-Apim-Subscription-Key": settings.AZURE_DOCUMENT_INTELLIGENCE_KEY,
            "Content-Type": "application/json",
        }
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(analyze_url, headers=headers, json={"urlSource": source_url})
            response.raise_for_status()
            operation_url = response.headers["operation-location"]

            for _ in range(60):
                poll = await client.get(operation_url, headers={"Ocp-Apim-Subscription-Key": settings.AZURE_DOCUMENT_INTELLIGENCE_KEY})
                poll.raise_for_status()
                payload = poll.json()
                status = payload.get("status")
                if status == "succeeded":
                    return payload.get("analyzeResult", {}).get("content", "")
                if status == "failed":
                    raise RuntimeError(payload.get("error", {}).get("message", "Document Intelligence analysis failed"))
                await asyncio.sleep(2)

        raise TimeoutError("Document Intelligence analysis timed out")

    async def ensure_search_index(self) -> None:
        endpoint = settings.AZURE_SEARCH_ENDPOINT.strip().rstrip("/")
        index_name = settings.AZURE_SEARCH_INDEX_NAME
        api_version = settings.AZURE_SEARCH_API_VERSION
        url = f"{endpoint}/indexes/{index_name}?api-version={api_version}"
        headers = self._search_headers()

        fields: list[dict[str, Any]] = [
            {"name": "id", "type": "Edm.String", "key": True, "filterable": True},
            {"name": "document_id", "type": "Edm.String", "filterable": True},
            {"name": "chunk_index", "type": "Edm.Int32", "filterable": True, "sortable": True},
            {"name": "title", "type": "Edm.String", "searchable": True, "filterable": True},
            {"name": "regulator", "type": "Edm.String", "searchable": True, "filterable": True, "facetable": True},
            {"name": "category", "type": "Edm.String", "searchable": True, "filterable": True, "facetable": True},
            {"name": "source_url", "type": "Edm.String", "filterable": True},
            {"name": "published_date", "type": "Edm.String", "filterable": True, "sortable": True},
            {"name": "section_heading", "type": "Edm.String", "searchable": True, "filterable": True},
            {"name": "content", "type": "Edm.String", "searchable": True},
        ]
        body: dict[str, Any] = {"name": index_name, "fields": fields}

        if self.embeddings_enabled():
            fields.append(
                {
                    "name": "content_vector",
                    "type": "Collection(Edm.Single)",
                    "searchable": True,
                    "dimensions": settings.RAG_EMBEDDING_DIMENSIONS,
                    "vectorSearchProfile": "default-vector-profile",
                }
            )
            body["vectorSearch"] = {
                "algorithms": [{"name": "default-hnsw", "kind": "hnsw"}],
                "profiles": [{"name": "default-vector-profile", "algorithm": "default-hnsw"}],
            }

        if settings.AZURE_SEARCH_SEMANTIC_CONFIG:
            body["semantic"] = {
                "configurations": [
                    {
                        "name": settings.AZURE_SEARCH_SEMANTIC_CONFIG,
                        "prioritizedFields": {
                            "titleField": {"fieldName": "title"},
                            "prioritizedContentFields": [{"fieldName": "content"}],
                            "prioritizedKeywordsFields": [
                                {"fieldName": "regulator"},
                                {"fieldName": "category"},
                                {"fieldName": "section_heading"},
                            ],
                        },
                    }
                ]
            }

        async with httpx.AsyncClient(timeout=60.0) as client:
            existing = await client.get(url, headers=headers)
            if existing.status_code == 200:
                existing_fields = existing.json().get("fields", [])
                self._search_fields = {field["name"] for field in existing_fields}
                searchable_fields = {
                    field["name"]
                    for field in existing_fields
                    if field.get("type") == "Edm.String" and field.get("searchable")
                }
                if "content" not in searchable_fields:
                    raise RuntimeError(
                        f"Azure AI Search index '{index_name}' already exists but is not compatible with Regulatory RAG. "
                        "It must have a searchable Edm.String field named 'content'. "
                        "Set AZURE_SEARCH_INDEX_NAME to a new value such as 'finguard-regulatory-rag-v2' and rerun ingestion, "
                        "or delete/recreate the existing index."
                    )
                return
            if existing.status_code != 404:
                existing.raise_for_status()
            create = await client.put(url, headers=headers, json=body)
            create.raise_for_status()
            self._search_fields = {field["name"] for field in fields}

    async def upload_to_search(self, documents: list[dict[str, Any]]) -> int:
        endpoint = settings.AZURE_SEARCH_ENDPOINT.strip().rstrip("/")
        index_name = settings.AZURE_SEARCH_INDEX_NAME
        api_version = settings.AZURE_SEARCH_API_VERSION
        url = f"{endpoint}/indexes/{index_name}/docs/index?api-version={api_version}"
        actions = [{"@search.action": "mergeOrUpload", **self._clean_search_document(document)} for document in documents]
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, headers=self._search_headers(), json={"value": actions})
            if response.status_code >= 400:
                raise RuntimeError(f"Azure AI Search upload failed: {response.status_code} {response.text[:1200]}")
        return len(documents)

    async def embed_text(self, text: str) -> list[float]:
        endpoint = settings.AZURE_OPENAI_ENDPOINT.strip().rstrip("/")
        deployment = settings.AZURE_OPENAI_EMBEDDING_DEPLOYMENT
        api_version = settings.AZURE_OPENAI_API_VERSION
        url = f"{endpoint}/openai/deployments/{deployment}/embeddings?api-version={api_version}"
        headers = {"api-key": settings.AZURE_OPENAI_API_KEY, "Content-Type": "application/json"}
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, headers=headers, json={"input": text})
            response.raise_for_status()
            return response.json()["data"][0]["embedding"]

    async def safe_embed_text(self, text: str) -> list[float] | None:
        if not self.embeddings_enabled():
            return None
        try:
            return await self.embed_text(text)
        except Exception as exc:
            self._embedding_failure = (
                "Azure OpenAI embeddings failed; continuing without vectors. "
                "Check AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_EMBEDDING_DEPLOYMENT, API key, and API version."
            )
            logger.warning("azure_embedding_failed fallback=no-vectors error=%s", exc)
            return None

    async def _search_azure(self, query: str, top_k: int) -> list[RagHit]:
        if self._search_fields is None:
            await self.ensure_search_index()
        endpoint = settings.AZURE_SEARCH_ENDPOINT.strip().rstrip("/")
        index_name = settings.AZURE_SEARCH_INDEX_NAME
        api_version = settings.AZURE_SEARCH_API_VERSION
        url = f"{endpoint}/indexes/{index_name}/docs/search?api-version={api_version}"
        selectable_fields = self._search_select_fields()
        body: dict[str, Any] = {
            "search": query,
            "top": top_k,
            "select": ",".join(selectable_fields) if selectable_fields else "*",
        }
        if settings.AZURE_SEARCH_SEMANTIC_CONFIG:
            body.update(
                {
                    "queryType": "semantic",
                    "semanticConfiguration": settings.AZURE_SEARCH_SEMANTIC_CONFIG,
                    "captions": "extractive",
                    "answers": "extractive|count-3",
                }
            )
        if self.embeddings_enabled() and self._search_fields and "content_vector" in self._search_fields:
            query_vector = await self.safe_embed_text(query)
            if query_vector:
                body["vectorQueries"] = [
                    {
                        "kind": "vector",
                        "vector": query_vector,
                        "fields": "content_vector",
                        "k": top_k,
                    }
                ]

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, headers=self._search_headers(), json=body)
            if response.status_code >= 400:
                raise RuntimeError(f"Azure AI Search query failed: {response.status_code} {response.text[:1200]}")
            values = response.json().get("value", [])

        return [
            RagHit(
                content=item.get("content", ""),
                title=item.get("title", "Regulatory source"),
                regulator=item.get("regulator", ""),
                category=item.get("category", ""),
                source_url=item.get("source_url", ""),
                published_date=item.get("published_date"),
                section_heading=item.get("section_heading"),
                score=float(item.get("@search.rerankerScore") or item.get("@search.score") or 0),
            )
            for item in values
        ]

    def _search_local(self, query: str, db: Session, top_k: int) -> list[RagHit]:
        chunks = db.query(RegulatoryChunk).join(RegulatoryDocument).all()
        query_tokens = self._tokens(query)
        scored: list[tuple[float, RegulatoryChunk]] = []
        for chunk in chunks:
            content_tokens = self._tokens(chunk.content)
            if not content_tokens:
                continue
            overlap = len(query_tokens & content_tokens)
            regulator_boost = 1.5 if chunk.document.regulator.lower() in query.lower() else 0
            category_boost = 1.0 if chunk.document.category.replace("_", " ") in query.lower() else 0
            score = overlap + regulator_boost + category_boost
            if score > 0:
                scored.append((score, chunk))
        scored.sort(key=lambda item: item[0], reverse=True)

        return [
            RagHit(
                content=chunk.content,
                title=chunk.document.title,
                regulator=chunk.document.regulator,
                category=chunk.document.category,
                source_url=chunk.document.source_url,
                published_date=chunk.document.published_date,
                section_heading=chunk.section_heading,
                score=score,
            )
            for score, chunk in scored[:top_k]
        ]

    def _upsert_document(self, db: Session, seed: dict[str, Any]) -> RegulatoryDocument:
        document = db.query(RegulatoryDocument).filter(RegulatoryDocument.source_url == seed["source_url"]).one_or_none()
        if document is None:
            document = RegulatoryDocument(source_url=seed["source_url"], title=seed["title"], regulator=seed["regulator"], category=seed["category"])
            db.add(document)
            db.flush()
        document.title = seed["title"]
        document.regulator = seed["regulator"]
        document.category = seed["category"]
        document.published_date = seed.get("published_date")
        document.document_type = seed.get("document_type", "web")
        document.raw_metadata = {"seed_document_id": seed["document_id"], **seed.get("raw_metadata", {})}
        return document

    def _blob_seed(self, pdf: BlobPdf, content: str) -> dict[str, Any]:
        stem = Path(pdf.name).stem.replace("_", " ").replace("-", " ").strip()
        title = re.sub(r"\s+", " ", stem).title() or pdf.name
        return {
            "document_id": self._stable_document_id(pdf.name),
            "title": title,
            "regulator": self._infer_regulator(pdf.name),
            "category": self._infer_category(pdf.name),
            "published_date": None,
            "source_url": pdf.public_url,
            "document_type": "pdf",
            "content": content,
            "raw_metadata": {
                "blob_name": pdf.name,
                "blob_size": pdf.size,
                "blob_last_modified": pdf.last_modified,
            },
        }

    def _stable_document_id(self, value: str) -> str:
        slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
        digest = hashlib.sha1(value.encode("utf-8")).hexdigest()[:10]
        return f"{slug[:80]}-{digest}"

    def _infer_regulator(self, blob_name: str) -> str:
        text = blob_name.lower()
        if "sebi" in text:
            return "SEBI"
        if "rbi" in text:
            return "RBI"
        if "irdai" in text:
            return "IRDAI"
        if "nse" in text:
            return "NSE"
        return "REGULATORY"

    def _infer_category(self, blob_name: str) -> str:
        text = blob_name.lower()
        if any(term in text for term in ["kyc", "aml", "pmla"]):
            return "kyc_aml"
        if "digital" in text and "lending" in text:
            return "digital_lending"
        if "investor" in text and "protection" in text:
            return "investor_protection"
        if any(term in text for term in ["advisor", "adviser", "investment-adviser", "investment_adviser"]):
            return "investment_advisers"
        if "circular" in text:
            return "circulars"
        return "general"

    def _replace_chunks(self, db: Session, document: RegulatoryDocument) -> None:
        db.query(RegulatoryChunk).filter(RegulatoryChunk.document_id == document.id).delete()

    def _chunk_content(self, content: str, target_size: int = 1200, overlap: int = 160) -> list[str]:
        text = re.sub(r"\s+", " ", content).strip()
        if not text:
            return []
        chunks = []
        start = 0
        while start < len(text):
            end = min(start + target_size, len(text))
            if end < len(text):
                sentence_end = max(text.rfind(". ", start, end), text.rfind("; ", start, end))
                if sentence_end > start + 500:
                    end = sentence_end + 1
            chunks.append(text[start:end].strip())
            start = max(end - overlap, end)
        return chunks

    def _search_document(
        self,
        seed: dict[str, Any],
        search_document_id: str,
        chunk_index: int,
        content: str,
        embedding: list[float] | None,
    ) -> dict[str, Any]:
        document = {
            "id": search_document_id,
            "document_id": seed["document_id"],
            "chunk_index": chunk_index,
            "title": seed["title"],
            "regulator": seed["regulator"],
            "category": seed["category"],
            "source_url": seed["source_url"],
            "published_date": seed.get("published_date"),
            "section_heading": self._extract_heading(content),
            "content": content,
        }
        if embedding is not None:
            document["content_vector"] = embedding
        return document

    def _clean_search_document(self, document: dict[str, Any]) -> dict[str, Any]:
        cleaned = {key: value for key, value in document.items() if value is not None}
        if self._search_fields is None:
            return cleaned
        return {key: value for key, value in cleaned.items() if key in self._search_fields}

    def _search_select_fields(self) -> list[str]:
        preferred = ["title", "regulator", "category", "source_url", "published_date", "section_heading", "content"]
        if self._search_fields is None:
            return preferred
        return [field for field in preferred if field in self._search_fields]

    def _format_context(self, hits: list[RagHit]) -> str:
        if not hits:
            return ""
        blocks = []
        for index, hit in enumerate(hits, start=1):
            blocks.append(
                "\n".join(
                    [
                        f"[{index}] {hit.title}",
                        f"Regulator: {hit.regulator}; Category: {hit.category}; Published: {hit.published_date or 'unknown'}",
                        f"Source: {hit.source_url}",
                        f"Content: {hit.content[:1400]}",
                    ]
                )
            )
        return "\n\n".join(blocks)

    def _deterministic_answer(self, query: str, context: str, citations: list[dict[str, Any]]) -> str:
        if not citations:
            return "\n".join(
                [
                    "## Direct Answer",
                    "I could not find a strong regulatory source in the current RAG corpus for this question.",
                    "",
                    "## Next Step",
                    "Add the relevant SEBI/RBI circular or regulation to the RAG corpus, then re-run ingestion.",
                ]
            )

        q = query.lower()
        if "investor protection" in q:
            return "\n".join(
                [
                    "## Direct Answer",
                    "SEBI's investor protection framework is a set of registration, disclosure, conduct, suitability, education, and grievance-redressal mechanisms designed to reduce mis-selling and help investors get fair treatment in the securities market.",
                    "",
                    "## How It Works",
                    "- SEBI regulates intermediaries such as investment advisers and requires registration or exemption before they can offer regulated advice.",
                    "- Investment advisers are expected to assess client goals, risk appetite, financial situation, and suitability before giving advice.",
                    "- Investors are encouraged to verify adviser registration, understand fees and conflicts, keep records, and use official grievance channels when needed.",
                    "- The framework is supported by SEBI regulations, investor awareness material, and complaint/redressal systems.",
                    "",
                    "## What To Do",
                    "- Verify whether the adviser/intermediary is SEBI-registered.",
                    "- Ask for fee disclosures, conflict disclosures, and written rationale for advice.",
                    "- Keep documentation of recommendations, risk profiling, and complaints.",
                    "- Use official SEBI investor resources or grievance channels for unresolved issues.",
                    "",
                    "## Sources",
                    *[f"* {line}" for line in self._source_lines(citations[:3])],
                    "",
                    "This is informational guidance. Verify against the latest SEBI source before making compliance decisions.",
                ]
            )

        if self._is_beginner_query(query):
            return "\n".join(
                [
                    "## Direct Answer",
                    "For beginners, Regulatory AI can explain the basics of SEBI/RBI rules, investor protection, KYC/AML, digital lending, and adviser compliance in simple language. Start with investor safety: verify registrations, understand fees and risks, keep records, and use official grievance channels when something looks wrong.",
                    "",
                    "## Beginner Checklist",
                    "- Verify whether an adviser, broker, lender, or intermediary is registered with the relevant regulator.",
                    "- Do not rely only on verbal promises; ask for written disclosures, risk explanations, and fee details.",
                    "- For investment advice, check whether the advice matches your risk profile, goals, and financial situation.",
                    "- For KYC/AML, understand that regulated entities must identify customers, verify documents, classify risk, and monitor transactions.",
                    "- For digital lending, check the lender, key fact statement, annual percentage rate, consent for data use, and grievance contact.",
                    "",
                    "## Good Questions To Ask Next",
                    "- What should I check before trusting an investment adviser?",
                    "- Explain SEBI investor protection in simple terms.",
                    "- What are basic KYC requirements in India?",
                    "- What should a borrower check before using a digital lending app?",
                    "",
                    "## Sources",
                    *[f"* {line}" for line in self._source_lines(citations[:3])],
                    "",
                    "This is informational guidance. Verify against the latest official regulator source.",
                ]
            )

        return "\n".join(
            [
                "## Direct Answer",
                self._context_summary(context),
                "",
                "## Sources",
                *[f"* {line}" for line in self._source_lines(citations[:3])],
                "",
                "This is informational guidance. Verify against the latest official regulator source.",
            ]
        )

    def _source_lines(self, citations: list[dict[str, Any]]) -> list[str]:
        return [
            f"{citation.get('title', 'Regulatory source')} ({citation.get('regulator', 'regulator')}) - {citation.get('source_url', '')}"
            for citation in citations
        ]

    def _context_summary(self, context: str) -> str:
        cleaned = re.sub(r"\s+", " ", context).strip()
        if not cleaned:
            return "The current RAG context does not contain enough detail for a complete answer."
        content_marker = "Content: "
        if content_marker in cleaned:
            cleaned = cleaned.split(content_marker, 1)[1]
        return cleaned[:900].rstrip() + ("..." if len(cleaned) > 900 else "")

    def _is_beginner_query(self, query: str) -> bool:
        text = query.lower()
        return any(term in text for term in ["beginner", "beginners", "advice", "advices", "start", "new investor"])

    def _search_headers(self) -> dict[str, str]:
        return {"api-key": settings.AZURE_SEARCH_ADMIN_KEY, "Content-Type": "application/json"}

    def _extract_heading(self, chunk: str) -> str | None:
        match = re.search(r"(^|\s)(CHAPTER|SECTION|Annex|Part)\s+[A-Z0-9IVX.-]+", chunk, re.IGNORECASE)
        return match.group(0).strip() if match else None

    def _tokens(self, text: str) -> set[str]:
        stop_words = {"the", "and", "or", "to", "of", "in", "for", "a", "an", "is", "are", "on", "with", "what", "how"}
        return {token for token in re.findall(r"[a-z0-9]+", text.lower()) if len(token) > 2 and token not in stop_words}


regulatory_rag_service = RegulatoryRagService()
