from typing import Any, Dict, List
from langchain_core.tools import tool
from app.services.analytics_service import analytics_service
from app.services.market_service import market_service
from app.services.regulatory_rag_service import regulatory_rag_service
from app.services.portfolio_service import portfolio_service
import asyncio

@tool
def get_portfolio_analytics(holdings: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Computes comprehensive portfolio analytics including total value, PnL, 
    sector allocation, diversification score, and risk score.
    """
    metrics = analytics_service.compute(holdings)
    return metrics.__dict__

@tool
def get_market_benchmarks() -> Dict[str, Any]:
    """
    Returns current market benchmark data (e.g., NIFTY 50) and risk-free rates.
    """
    return market_service.benchmark_snapshot()

@tool
async def search_regulatory_knowledge(query: str, session_id: str = "aihub") -> str:
    """
    Searches the regulatory RAG database for SEBI/RBI regulations, circulars, 
    and compliance requirements relevant to the query.
    """
    # Use a dummy session_id if not provided to keep it working
    result = await regulatory_rag_service.answer(query, None, session_id)
    return result.response

@tool
def analyze_concentration_risk(holdings: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Provides a deep dive into concentration risk, identifying top holdings 
    and their impact on the overall portfolio risk profile.
    """
    metrics = analytics_service.compute(holdings)
    return metrics.concentration

@tool
def get_performance_highlights(holdings: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Returns performance-specific metrics like top gainers, top losers, 
    and estimated CAGR for the portfolio.
    """
    metrics = analytics_service.compute(holdings)
    return {
        "top_gainers": metrics.top_gainers,
        "top_losers": metrics.top_losers,
        "cagr": metrics.cagr
    }

# Export list of tools for agents
PORTFOLIO_TOOLS = [get_portfolio_analytics, analyze_concentration_risk]
RISK_TOOLS = [get_portfolio_analytics, analyze_concentration_risk, get_market_benchmarks]
PERFORMANCE_TOOLS = [get_performance_highlights, get_market_benchmarks]
COMPLIANCE_TOOLS = [search_regulatory_knowledge]
ALL_TOOLS = PORTFOLIO_TOOLS + RISK_TOOLS + PERFORMANCE_TOOLS + COMPLIANCE_TOOLS
