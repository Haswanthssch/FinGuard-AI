# FinGuard Regulatory RAG Setup

This backend supports a regulatory RAG pipeline for the Regulatory AI screen.

## What It Uses

- Azure Document Intelligence: parses official regulatory documents during ingestion.
- Azure AI Search: stores searchable chunks and retrieves grounding context.
- Azure OpenAI embeddings: optional, used for vector or hybrid search when configured.
- Local database: stores document and chunk metadata for fallback retrieval.
- Groq: still used as the answer generation LLM when configured.

## Minimal Demo Mode

You can run the app without Azure keys. The backend will load the bundled seed corpus from:

```text
backend/rag_documents/regulatory_seed_corpus.json
```

Then regulatory chat uses local keyword retrieval as fallback.

Run:

```powershell
cd backend
python scripts/ingest_regulatory_rag.py --no-document-intelligence --no-search-upload
```

## Azure Mode

Create these Azure resources:

1. Azure AI Search service
2. Azure AI Document Intelligence resource
3. Azure OpenAI resource with an embeddings deployment, optional but recommended

Add these variables to `backend/.env`:

```env
AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=https://YOUR-DOC-INTEL.cognitiveservices.azure.com
AZURE_DOCUMENT_INTELLIGENCE_KEY=YOUR_DOCUMENT_INTELLIGENCE_KEY
AZURE_DOCUMENT_INTELLIGENCE_API_VERSION=2024-11-30

AZURE_BLOB_CONTAINER_URL=https://YOUR-STORAGE.blob.core.windows.net/regulatory-docs
AZURE_BLOB_SAS_TOKEN=sp=...&sig=...
AZURE_BLOB_PDF_PREFIX=

AZURE_SEARCH_ENDPOINT=https://YOUR-SEARCH.search.windows.net
AZURE_SEARCH_ADMIN_KEY=YOUR_SEARCH_ADMIN_KEY
AZURE_SEARCH_INDEX_NAME=finguard-regulatory-rag-v2
AZURE_SEARCH_API_VERSION=2024-07-01
AZURE_SEARCH_SEMANTIC_CONFIG=

AZURE_OPENAI_ENDPOINT=https://YOUR-AOAI.openai.azure.com
AZURE_OPENAI_API_KEY=YOUR_AZURE_OPENAI_KEY
AZURE_OPENAI_EMBEDDING_DEPLOYMENT=text-embedding-3-small
AZURE_OPENAI_API_VERSION=2024-02-01
RAG_EMBEDDING_DIMENSIONS=1536
RAG_TOP_K=5
```

The Blob SAS token must include container-level **Read** and **List** permissions. In SAS terms, `sp` should include at least `r` and `l`, for example `sp=rl...`.

Use a new Azure AI Search index name for this app. If an index already exists but was created with another schema, ingestion will fail because RAG requires a searchable `content` field.

If you do not have a valid Azure OpenAI embeddings deployment yet, leave these blank:

```env
AZURE_OPENAI_ENDPOINT=
AZURE_OPENAI_API_KEY=
AZURE_OPENAI_EMBEDDING_DEPLOYMENT=
```

The RAG still works with Azure AI Search keyword/semantic retrieval.

Then ingest:

```powershell
cd backend
python scripts/ingest_regulatory_rag.py --source blob
```

If you want Azure AI Search but not embeddings yet:

```powershell
cd backend
python scripts/ingest_regulatory_rag.py --source seed
```

Seed mode skips Document Intelligence by default to save credits. To explicitly run seed URLs through Document Intelligence:

```powershell
python scripts/ingest_regulatory_rag.py --source seed --use-document-intelligence
```

To ingest both the bundled starter corpus and your Blob PDFs:

```powershell
cd backend
python scripts/ingest_regulatory_rag.py --source all
```

## API Endpoints

These endpoints require the normal app auth token.

```http
GET /api/v1/regulatory/rag/status
```

Returns document count, chunk count, and whether Azure services are configured.

```http
POST /api/v1/regulatory/rag/ingest
Content-Type: application/json

{
  "source": "blob",
  "use_document_intelligence": true,
  "upload_to_search": true
}
```

Loads documents from `source`: `seed`, `blob`, or `all`. Blob mode lists PDFs from Azure Blob Storage, sends Blob URLs to Document Intelligence, stores metadata locally, and uploads chunks to Azure AI Search.

## Blob PDF Layout

Recommended container:

```text
regulatory-docs/
  sebi/
    investor-protection/
    investment-advisers/
  rbi/
    kyc-aml/
    digital-lending/
```

Set `AZURE_BLOB_PDF_PREFIX` if you only want to ingest one folder, for example:

```env
AZURE_BLOB_PDF_PREFIX=sebi/investor-protection
```

The ingestion metadata stores:

- Blob name
- Blob URL without SAS
- Blob size
- Blob last modified date
- Inferred regulator/category
- Document Intelligence extracted chunks

## Current Seed Sources

- SEBI Investment Advisers Regulations, 2013
- SEBI investor guidance on Investment Advisors
- RBI Master Direction - KYC Direction, 2016
- RBI FAQs on Master Direction on KYC
- RBI Guidelines on Digital Lending
- RBI FAQs on Digital Lending Guidelines

## Query Flow

```text
Regulatory AI message
  -> /api/v1/chat
  -> AI Hub route detects SEBI/RBI/KYC/AML/compliance keywords
  -> Regulatory RAG retrieval
  -> Compliance agent receives retrieved context
  -> Groq generates answer when available
  -> Response includes citations
```

## Credit-Saving Notes

- Document Intelligence is used only during ingestion, not every chat.
- Azure AI Search is used per regulatory query.
- Embeddings are optional. Without Azure OpenAI embeddings, the system still uses Azure AI Search keyword/semantic retrieval.
- Local RAG fallback prevents the app from failing when Azure credentials are missing.
