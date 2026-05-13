from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, Float, ForeignKey, Index, Integer, LargeBinary, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Portfolio(Base):
    __tablename__ = "portfolios"
    __table_args__ = (
        Index("ix_portfolios_user_uploaded", "user_id", "upload_timestamp"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), index=True, nullable=False)
    portfolio_name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    risk_profile: Mapped[str] = mapped_column(String(20), default="MEDIUM")
    upload_timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    total_value: Mapped[float] = mapped_column(Float, default=0.0)
    total_pnl: Mapped[float] = mapped_column(Float, default=0.0)
    total_pnl_pct: Mapped[float] = mapped_column(Float, default=0.0)
    risk_score: Mapped[float] = mapped_column(Float, default=0.0)
    diversification_score: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="portfolios")
    holdings = relationship("Holding", back_populates="portfolio", cascade="all, delete-orphan")
    upload_files = relationship("PortfolioUploadFile", back_populates="portfolio", cascade="all, delete-orphan")

    @property
    def portfolio_id(self) -> str:
        return self.id

    @property
    def name(self) -> str:
        return self.portfolio_name


class Holding(Base):
    __tablename__ = "holdings"
    __table_args__ = (
        Index("ix_holdings_portfolio_sector", "portfolio_id", "sector"),
        Index("ix_holdings_portfolio_isin", "portfolio_id", "isin"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    portfolio_id: Mapped[str] = mapped_column(String(36), ForeignKey("portfolios.id"), index=True, nullable=False)
    stock_name: Mapped[str] = mapped_column(String(255), nullable=False)
    isin: Mapped[str | None] = mapped_column(String(32), nullable=True, index=True)
    quantity: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    average_buy_price: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    buy_value: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    closing_price: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    closing_value: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    unrealized_pnl: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    sector: Mapped[str | None] = mapped_column(String(100), nullable=True)
    asset_type: Mapped[str] = mapped_column(String(50), default="Equity")
    exchange: Mapped[str] = mapped_column(String(10), default="NSE")
    last_updated: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    portfolio = relationship("Portfolio", back_populates="holdings")

    @property
    def holding_id(self) -> str:
        return self.id

    @property
    def symbol(self) -> str:
        return self.stock_name

    @property
    def company_name(self) -> str:
        return self.stock_name

    @property
    def purchase_price(self) -> float:
        return self.average_buy_price

    @property
    def current_price(self) -> float:
        return self.closing_price


class PortfolioUploadFile(Base):
    __tablename__ = "portfolio_upload_files"
    __table_args__ = (
        Index("ix_portfolio_upload_files_portfolio_created", "portfolio_id", "created_at"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    portfolio_id: Mapped[str] = mapped_column(String(36), ForeignKey("portfolios.id"), index=True, nullable=False)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    content_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    blob_name: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    blob_url: Mapped[str | None] = mapped_column(String(2000), nullable=True)
    storage_backend: Mapped[str] = mapped_column(String(20), default="database")
    content: Mapped[bytes | None] = mapped_column(LargeBinary, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)

    portfolio = relationship("Portfolio", back_populates="upload_files")
