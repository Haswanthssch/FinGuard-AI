from datetime import date, datetime
from pydantic import BaseModel, Field


class HoldingInput(BaseModel):
    symbol: str | None = None
    stock_name: str | None = None
    isin: str | None = None
    exchange: str = "NSE"
    company_name: str | None = None
    sector: str | None = None
    asset_type: str = "Equity"
    quantity: float = Field(gt=0)
    purchase_price: float = Field(gt=0)
    average_buy_price: float | None = None
    buy_value: float | None = None
    purchase_date: date | None = None
    current_price: float | None = None
    closing_price: float | None = None
    closing_value: float | None = None
    unrealized_pnl: float | None = None


class HoldingResponse(HoldingInput):
    holding_id: str
    portfolio_id: str
    stock_name: str
    isin: str | None = None
    average_buy_price: float
    buy_value: float
    closing_price: float
    closing_value: float
    unrealized_pnl: float
    current_value: float
    pnl: float
    pnl_pct: float
    last_updated: datetime | None = None


class PortfolioCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    portfolio_name: str | None = None
    description: str | None = None
    risk_profile: str = "MEDIUM"
    holdings: list[HoldingInput] = []


class PortfolioUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    risk_profile: str | None = None


class PortfolioResponse(BaseModel):
    portfolio_id: str
    id: str
    user_id: str
    name: str
    portfolio_name: str
    description: str | None = None
    risk_profile: str = "MEDIUM"
    total_value: float
    total_pnl: float
    total_pnl_pct: float
    risk_score: float
    diversification_score: float
    holdings_count: int
    created_at: datetime
    updated_at: datetime
    upload_timestamp: datetime


class PortfolioDetailResponse(PortfolioResponse):
    holdings: list[HoldingResponse]
    sector_allocation: dict[str, float] = {}
    top_holdings: list[dict] = []
    top_gainers: list[dict] = []
    top_losers: list[dict] = []
    concentration: dict = {}


class PortfolioAnalysisRequest(BaseModel):
    portfolio_id: str | None = None
    holdings: list[HoldingInput] = []
    query: str = "Analyze this portfolio."
