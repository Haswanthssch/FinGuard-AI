from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.routes.aihub import chat as aihub_chat
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.analysis import AnalysisHistory
from app.models.user import User
from app.schemas.aihub import AIHubChatRequest

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("")
async def chat(payload: AIHubChatRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await aihub_chat(payload, db, current_user)
    return {
        "session_id": result.session_id,
        "response": result.response,
        "citations": result.citations,
        "llm_source": result.llm_source,
        "skills_used": result.skills_used,
    }


@router.get("/history/{session_id}")
async def history(session_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rows = (
        db.query(AnalysisHistory)
        .filter(AnalysisHistory.user_id == current_user.user_id, AnalysisHistory.session_id == session_id)
        .order_by(AnalysisHistory.created_at.asc())
        .all()
    )
    messages = []
    for row in rows:
        messages.append({"role": "user", "content": row.query})
        messages.append({"role": "assistant", "content": row.response})
    return messages


@router.delete("/history/{session_id}", status_code=204)
async def clear_history(session_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rows = (
        db.query(AnalysisHistory)
        .filter(AnalysisHistory.user_id == current_user.user_id, AnalysisHistory.session_id == session_id)
        .all()
    )
    for row in rows:
        db.delete(row)
    db.commit()
    return None

