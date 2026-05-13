from typing import Any

from app.services.analytics_service import analytics_service
from app.services.market_service import market_service


def build_portfolio_context(holdings: list[dict[str, Any]]) -> dict[str, Any]:
    metrics = analytics_service.compute(holdings)
    return {
        "holdings": holdings,
        "metrics": metrics.__dict__,
        "portfolio_context": {
            "total_value": metrics.total_value,
            "top_sector": metrics.top_sector,
            "largest_holding": metrics.largest_holding,
            "diversification_score": metrics.diversification_score,
            "risk_score": metrics.risk_score,
            "high_risk_exposure": metrics.high_risk_exposure,
            "sector_allocation": metrics.sector_allocation,
            "concentration": metrics.concentration,
        },
        "benchmark": market_service.benchmark_snapshot(),
    }
