from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.agents.orchestrator import aihub_orchestrator
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.analysis import AnalysisHistory
from app.models.user import User
from app.schemas.aihub import AIHubChatRequest, AIHubChatResponse
from app.services.portfolio_service import portfolio_service
from app.services.regulatory_rag_service import regulatory_rag_service
from app.utils.helpers import new_session_id

router = APIRouter(prefix="/aihub", tags=["aihub"])

def _resolve_holdings(payload: AIHubChatRequest, db: Session, user: User) -> list[dict]:
    if payload.portfolio_data and isinstance(payload.portfolio_data.get("holdings"), list):
        return payload.portfolio_data["holdings"]

    portfolio = None
    if payload.portfolio_id:
        portfolio = portfolio_service.get_portfolio(db, user, payload.portfolio_id)
    if not portfolio:
        portfolio = portfolio_service.get_latest_portfolio(db, user)
    return portfolio_service.holdings_as_dicts(portfolio)


def _resolve_portfolio_id(payload: AIHubChatRequest, db: Session, user: User) -> str | None:
    if payload.portfolio_id:
        return payload.portfolio_id
    portfolio = portfolio_service.get_latest_portfolio(db, user)
    return portfolio.id if portfolio else None



from app.agents.multi_agent.orchestrator import multi_agent_orchestrator

@router.post("/chat", response_model=AIHubChatResponse)
async def chat(payload: AIHubChatRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    session_id = payload.session_id or new_session_id()
    holdings = _resolve_holdings(payload, db, current_user)
    context = payload.context or {}
    
    # The new orchestrator handles everything: routing, tools, and regulatory lookups
    result = await multi_agent_orchestrator.run(
        query=payload.message,
        holdings=holdings,
        session_id=session_id,
        context=context,
    )
    
    # Track analysis history
    db.add(
        AnalysisHistory(
            user_id=current_user.user_id,
            portfolio_id=_resolve_portfolio_id(payload, db, current_user),
            session_id=session_id,
            query=payload.message,
            agent_used=",".join(result.agents_used) or "supervisor",
            response=result.response,
            agents_used=result.agents_used,
            payload=result.model_dump(mode="json"),
        )
    )
    db.commit()
    return result
