from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class AnalysisHistory(Base):
    __tablename__ = "ai_analysis_history"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), index=True, nullable=False)
    portfolio_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("portfolios.id"), index=True, nullable=True)
    session_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    query: Mapped[str] = mapped_column(Text, nullable=False)
    agent_used: Mapped[str] = mapped_column(String(255), default="orchestrator")
    response: Mapped[str] = mapped_column(Text, nullable=False)
    agents_used: Mapped[list] = mapped_column(JSON, default=list)
    payload: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="analyses")

    @property
    def analysis_id(self) -> str:
        return self.id
