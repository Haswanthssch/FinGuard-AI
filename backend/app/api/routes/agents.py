from fastapi import APIRouter, HTTPException

from app.agents.compliance_agent import ComplianceIntelligenceAgent
from app.agents.performance_agent import PerformanceAnalyticsAgent
from app.agents.portfolio_agent import PortfolioIntelligenceAgent
from app.agents.risk_agent import RiskExposureAgent
from app.agents.tools import build_portfolio_context
from app.schemas.aihub import AgentAnalyzeRequest, AgentAnalyzeResponse

router = APIRouter(prefix="/agents", tags=["agents"])

AGENTS = {
    "portfolio": PortfolioIntelligenceAgent(),
    "risk": RiskExposureAgent(),
    "performance": PerformanceAnalyticsAgent(),
    "compliance": ComplianceIntelligenceAgent(),
}


@router.post("/analyze", response_model=AgentAnalyzeResponse)
async def analyze(payload: AgentAnalyzeRequest):
    agent = AGENTS.get(payload.agent)
    if not agent:
        raise HTTPException(status_code=400, detail=f"Unknown agent: {payload.agent}")
    holdings = payload.portfolio_data.get("holdings", []) if payload.portfolio_data else [h.model_dump() for h in payload.holdings]
    context = {**build_portfolio_context(holdings), **(payload.context or {})}
    result = await agent.run(payload.query, context)
    return AgentAnalyzeResponse(
        agent=payload.agent,
        analysis=result.raw_output or result.summary,
        thinking=f"Used {payload.agent} agent with structured portfolio analytics.",
        model_used="llama-3.3-70b-versatile",
    )


@router.post("/stress-test")
async def stress_test(payload: dict):
    portfolio_data = payload.get("portfolio_data", {})
    total_value = float(portfolio_data.get("total_value", 0) or 0)
    scenarios = {
        "market_crash": -0.25,
        "rate_hike": -0.12,
        "recession": -0.35,
        "inflation_shock": -0.08,
    }
    results = {
        name: {
            "portfolio_loss_percent": impact * 100,
            "estimated_loss_amount": total_value * impact,
        }
        for name, impact in scenarios.items()
    }
    return {"agent": "risk", "stress_test_results": results, "max_loss_scenario": "recession"}


@router.post("/performance-metrics")
async def performance_metrics(payload: dict):
    holdings = payload.get("portfolio_data", {}).get("holdings", [])
    context = build_portfolio_context(holdings)
    return {
        "agent": "performance",
        "metrics": context["metrics"],
        "outperforming_benchmark": context["metrics"].get("total_pnl_pct", 0) > context["benchmark"].get("one_year_return_pct", 0),
    }


@router.get("/available")
async def available_agents():
    agents = [
        {
            "id": "portfolio",
            "name": "Portfolio Intelligence Agent",
            "emoji": "PI",
            "description": "Allocation, diversification, sector exposure, and rebalancing intelligence.",
            "capabilities": ["Diversification analysis", "Allocation insight", "Rebalancing suggestions"],
        },
        {
            "id": "risk",
            "name": "Risk & Exposure Agent",
            "emoji": "RX",
            "description": "Volatility, downside, concentration, liquidity, and risk scoring.",
            "capabilities": ["Risk scoring", "Concentration analysis", "Stress testing"],
        },
        {
            "id": "performance",
            "name": "Performance Analytics Agent",
            "emoji": "PA",
            "description": "CAGR, returns, benchmark comparison, and growth analytics.",
            "capabilities": ["CAGR", "Benchmark comparison", "Return attribution"],
        },
        {
            "id": "compliance",
            "name": "Compliance Intelligence Agent",
            "emoji": "CI",
            "description": "SEBI/RBI contextual reasoning and compliance summaries.",
            "capabilities": ["Compliance interpretation", "Suitability flags", "Disclosure guidance"],
        },
    ]
    return {"agents": agents, "total": len(agents)}

