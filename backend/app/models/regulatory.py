from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class RegulatoryDocument(Base):
    __tablename__ = "regulatory_documents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    regulator: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    category: Mapped[str] = mapped_column(String(128), index=True, nullable=False)
    source_url: Mapped[str] = mapped_column(Text, nullable=False)
    published_date: Mapped[str | None] = mapped_column(String(32), nullable=True)
    document_type: Mapped[str] = mapped_column(String(64), default="web")
    raw_metadata: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    chunks = relationship("RegulatoryChunk", back_populates="document", cascade="all, delete-orphan")


class RegulatoryChunk(Base):
    __tablename__ = "regulatory_chunks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    document_id: Mapped[str] = mapped_column(String(36), ForeignKey("regulatory_documents.id"), index=True, nullable=False)
    chunk_index: Mapped[int] = mapped_column(index=True, nullable=False)
    section_heading: Mapped[str | None] = mapped_column(String(500), nullable=True)
    page_number: Mapped[str | None] = mapped_column(String(32), nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    search_document_id: Mapped[str] = mapped_column(String(128), index=True, nullable=False)
    embedding: Mapped[list | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    document = relationship("RegulatoryDocument", back_populates="chunks")
