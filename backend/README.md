# FinGuard AI Hub Backend

Production-structured FastAPI backend for the FinGuard AI Hub multi-agent orchestration system.

This backend focuses on the AI Hub only. Regulatory RAG is intentionally not implemented in this rebuild phase.

## Features

- FastAPI app with `/api/v1` versioning
- Groq-powered LLM service using `llama-3.3-70b-versatile`
- LangGraph multi-agent orchestration
- Master orchestrator agent
- Portfolio Intelligence Agent
- Risk & Exposure Agent
- Performance Analytics Agent
- Compliance Intelligence Agent
- Shared state/context across agents
- SQLite persistence
- Users, portfolios, holdings, and analysis history tables
- CSV/XLSX portfolio upload and normalization
- Portfolio snapshot persistence and holdings history
- Dashboard-ready portfolio analytics
- JWT auth structure
- Request logging middleware
- CORS configuration
- Compatibility routes for the existing frontend

## Architecture

```text
User query
  -> POST /api/v1/aihub/chat
  -> AIHubOrchestrator
  -> LangGraph prepare_context node
  -> LangGraph router node
  -> selected specialist agent nodes
  -> synthesis node
  -> structured AIHub response
```

Specialist agents use deterministic portfolio analytics as grounded tool output, then Groq reasoning when `GROQ_API_KEY` is configured. If Groq is unavailable or rate-limited, the backend returns deterministic professional analysis instead of crashing.

## Setup

```bash
cd backend
python -m venv .venv
.venv/Scripts/activate  # Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```

Set your Groq key:

```env
GROQ_API_KEY=gsk_xxx
```

Run locally:

```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Health check:

```bash
curl http://127.0.0.1:8000/api/v1/health
```

## Main APIs

### AI Hub Orchestration

`POST /api/v1/aihub/chat`

```json
{
  "message": "Analyze my risk and performance",
  "session_id": "optional",
  "portfolio_id": "optional",
  "portfolio_data": {
    "holdings": []
  }
}
```

Returns:

- `summary`
- `insights`
- `recommendations`
- `risk_observations`
- `confidence_notes`
- `agents_used`
- `contributions`
- `response`

### Frontend Compatibility Chat

`POST /api/v1/chat`

Returns the existing frontend shape:

```json
{
  "session_id": "...",
  "response": "...",
  "citations": [],
  "llm_source": "groq",
  "skills_used": ["portfolio", "risk"]
}
```

### Portfolio

- `GET /api/v1/portfolio`
- `POST /api/v1/portfolio`
- `GET /api/v1/portfolio/{portfolio_id}`
- `PUT /api/v1/portfolio/{portfolio_id}`
- `DELETE /api/v1/portfolio/{portfolio_id}`
- `POST /api/v1/portfolio/upload`
- `POST /api/v1/portfolio/upload-csv`
- `GET /api/v1/portfolio/{portfolio_id}/metrics`
- `GET /api/v1/portfolio/{portfolio_id}/risk-assessment`
- `POST /api/v1/portfolio/analyze`

Upload accepts CSV/XLSX files with broker-style columns such as:

- Stock Name
- ISIN
- Quantity
- Avg Buy Price
- Buy Value
- Closing Price
- Closing Value
- Unrealised P&L
- Sector
- Asset Type

The parser normalizes column aliases, validates required fields, fills derived values when possible, stores a portfolio snapshot, stores holdings, calculates analytics, and returns a frontend-friendly response.

Example:

```bash
curl -X POST http://127.0.0.1:8000/api/v1/portfolio/upload \
  -F "portfolio_name=Primary Portfolio" \
  -F "file=@portfolio.csv"
```

Example upload response:

```json
{
  "message": "Portfolio uploaded successfully",
  "portfolio_id": "uuid",
  "portfolio_name": "Primary Portfolio",
  "total_value": 1250000,
  "total_pnl": 84000,
  "risk_score": 5.7,
  "diversification_score": 74,
  "holdings_count": 18
}
```

Portfolio analytics include:

- total value
- unrealized P&L
- sector allocation
- diversification score
- top holdings
- top gainers and losers
- concentration analysis
- risk score

The AI Hub orchestrator automatically loads the selected or latest user portfolio and passes structured portfolio context to all specialist agents.

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`

For local development, unauthenticated API calls resolve to a demo user automatically so the existing frontend can work quickly.

## Azure Readiness

The current implementation uses SQLite for local development. For Azure:

- replace `DATABASE_URL` with PostgreSQL
- configure secure `JWT_SECRET_KEY`
- store `GROQ_API_KEY` in Key Vault
- run with Gunicorn/Uvicorn workers or Azure App Service container startup
- add Alembic migrations before production rollout
