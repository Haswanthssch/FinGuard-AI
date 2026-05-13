from typing import Any

from sqlalchemy.orm import Session, selectinload

from app.models.portfolio import Holding, Portfolio, PortfolioUploadFile
from app.models.user import User
from app.schemas.portfolio import PortfolioCreate, PortfolioUpdate
from app.services.analytics_service import analytics_service


class PortfolioService:
    def list_user_portfolios(self, db: Session, user: User) -> list[Portfolio]:
        return db.query(Portfolio).filter(Portfolio.user_id == user.user_id).all()

    def get_portfolio(self, db: Session, user: User, portfolio_id: str) -> Portfolio | None:
        return (
            db.query(Portfolio)
            .options(selectinload(Portfolio.holdings))
            .filter(Portfolio.user_id == user.user_id, Portfolio.id == portfolio_id)
            .first()
        )

    def get_latest_portfolio(self, db: Session, user: User) -> Portfolio | None:
        return (
            db.query(Portfolio)
            .options(selectinload(Portfolio.holdings))
            .filter(Portfolio.user_id == user.user_id)
            .order_by(Portfolio.updated_at.desc())
            .first()
        )

    def create_portfolio(self, db: Session, user: User, payload: PortfolioCreate) -> Portfolio:
        holdings = [self._normalize_input_holding(item.model_dump()) for item in payload.holdings]
        metrics = analytics_service.compute(holdings)
        portfolio = Portfolio(
            user_id=user.user_id,
            portfolio_name=payload.portfolio_name or payload.name,
            description=payload.description,
            risk_profile=payload.risk_profile,
            total_value=metrics.total_value,
            total_pnl=metrics.total_pnl,
            total_pnl_pct=metrics.total_pnl_pct,
            risk_score=metrics.risk_score,
            diversification_score=metrics.diversification_score,
        )
        db.add(portfolio)
        db.flush()
        for item in holdings:
            db.add(Holding(portfolio_id=portfolio.id, **item))
        db.commit()
        db.refresh(portfolio)
        return self.get_portfolio(db, user, portfolio.id) or portfolio

    def create_from_holdings(
        self,
        db: Session,
        user: User,
        portfolio_name: str,
        holdings: list[dict[str, Any]],
        description: str | None = None,
        upload_file: dict[str, Any] | None = None,
    ) -> Portfolio:
        normalized = [self._normalize_input_holding(item) for item in holdings]
        metrics = analytics_service.compute(normalized)
        portfolio = Portfolio(
            user_id=user.user_id,
            portfolio_name=portfolio_name,
            description=description,
            total_value=metrics.total_value,
            total_pnl=metrics.total_pnl,
            total_pnl_pct=metrics.total_pnl_pct,
            risk_score=metrics.risk_score,
            diversification_score=metrics.diversification_score,
        )
        db.add(portfolio)
        db.flush()
        for item in normalized:
            db.add(Holding(portfolio_id=portfolio.id, **item))
        if upload_file:
            db.add(
                PortfolioUploadFile(
                    portfolio_id=portfolio.id,
                    filename=upload_file["filename"],
                    content_type=upload_file.get("content_type"),
                    size_bytes=upload_file["size_bytes"],
                    blob_name=upload_file.get("blob_name"),
                    blob_url=upload_file.get("blob_url"),
                    storage_backend=upload_file.get("storage_backend", "database"),
                    content=upload_file.get("content"),
                )
            )
        db.commit()
        db.refresh(portfolio)
        return self.get_portfolio(db, user, portfolio.id) or portfolio

    def attach_upload_file(self, db: Session, portfolio: Portfolio, upload_file: dict[str, Any]) -> Portfolio:
        db.add(
            PortfolioUploadFile(
                portfolio_id=portfolio.id,
                filename=upload_file["filename"],
                content_type=upload_file.get("content_type"),
                size_bytes=upload_file["size_bytes"],
                blob_name=upload_file.get("blob_name"),
                blob_url=upload_file.get("blob_url"),
                storage_backend=upload_file.get("storage_backend", "database"),
                content=upload_file.get("content"),
            )
        )
        db.commit()
        db.refresh(portfolio)
        return portfolio

    def update_portfolio(self, db: Session, user: User, portfolio_id: str, payload: PortfolioUpdate) -> Portfolio | None:
        portfolio = self.get_portfolio(db, user, portfolio_id)
        if not portfolio:
            return None
        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(portfolio, key, value)
        db.commit()
        db.refresh(portfolio)
        return portfolio

    def delete_portfolio(self, db: Session, user: User, portfolio_id: str) -> bool:
        portfolio = self.get_portfolio(db, user, portfolio_id)
        if not portfolio:
            return False
        db.delete(portfolio)
        db.commit()
        return True

    def holdings_as_dicts(self, portfolio: Portfolio | None) -> list[dict[str, Any]]:
        if not portfolio:
            return []
        return [
            {
                "symbol": h.stock_name,
                "stock_name": h.stock_name,
                "isin": h.isin,
                "exchange": h.exchange,
                "company_name": h.stock_name,
                "sector": h.sector or "Others",
                "asset_type": h.asset_type,
                "quantity": h.quantity,
                "purchase_price": h.average_buy_price,
                "average_buy_price": h.average_buy_price,
                "buy_value": h.buy_value,
                "purchase_date": None,
                "current_price": h.closing_price,
                "closing_price": h.closing_price,
                "closing_value": h.closing_value,
                "unrealized_pnl": h.unrealized_pnl,
            }
            for h in portfolio.holdings
        ]

    def summarize(self, portfolio: Portfolio) -> dict[str, Any]:
        holdings = self.holdings_as_dicts(portfolio)
        metrics = analytics_service.compute(holdings)
        return {
            "portfolio_id": portfolio.id,
            "id": portfolio.id,
            "user_id": portfolio.user_id,
            "name": portfolio.portfolio_name,
            "portfolio_name": portfolio.portfolio_name,
            "description": portfolio.description,
            "risk_profile": portfolio.risk_profile,
            "total_value": metrics.total_value,
            "total_pnl": metrics.total_pnl,
            "total_pnl_pct": metrics.total_pnl_pct,
            "risk_score": metrics.risk_score,
            "diversification_score": metrics.diversification_score,
            "holdings_count": metrics.holdings_count,
            "created_at": portfolio.created_at,
            "updated_at": portfolio.updated_at,
            "upload_timestamp": portfolio.upload_timestamp,
        }

    def analytics_payload(self, portfolio: Portfolio) -> dict[str, Any]:
        metrics = analytics_service.compute(self.holdings_as_dicts(portfolio))
        return metrics.__dict__

    def _normalize_input_holding(self, item: dict[str, Any]) -> dict[str, Any]:
        stock_name = item.get("stock_name") or item.get("company_name") or item.get("symbol") or "Unknown"
        quantity = float(item.get("quantity") or 0)
        average_buy_price = float(item.get("average_buy_price") or item.get("purchase_price") or 0)
        buy_value = float(item.get("buy_value") or quantity * average_buy_price)
        closing_price = float(item.get("closing_price") or item.get("current_price") or average_buy_price)
        closing_value = float(item.get("closing_value") or quantity * closing_price)
        unrealized_pnl = float(item.get("unrealized_pnl") if item.get("unrealized_pnl") is not None else closing_value - buy_value)
        return {
            "stock_name": str(stock_name),
            "isin": item.get("isin"),
            "quantity": quantity,
            "average_buy_price": average_buy_price,
            "buy_value": buy_value,
            "closing_price": closing_price,
            "closing_value": closing_value,
            "unrealized_pnl": unrealized_pnl,
            "sector": item.get("sector") or "Others",
            "asset_type": item.get("asset_type") or "Equity",
            "exchange": item.get("exchange") or "NSE",
        }


portfolio_service = PortfolioService()
