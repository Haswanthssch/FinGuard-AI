from typing import Any

from app.agents.base import BaseFinancialAgent
from app.agents.prompts import AGENT_PROMPTS


class PortfolioIntelligenceAgent(BaseFinancialAgent):
    name = "portfolio"
    system_prompt = AGENT_PROMPTS["portfolio"]

    def _fallback(self, query: str, context: dict[str, Any]) -> str:
        text = self._normalize_query(query)
        metrics = context.get("metrics", {})
        sectors = metrics.get("sector_allocation", {})
        if "diversification" in text:
            return "\n".join(
                [
                    "Summary:",
                    "Diversification means spreading exposure so one stock, sector, theme, or asset class cannot dominate the portfolio outcome.",
                    "",
                    "Key Insights:",
                    f"- {self._portfolio_snapshot_line(context)}",
                    f"- Current diversification score: {metrics.get('diversification_score', 0)}/100.",
                    f"- Largest holding concentration: {self._pct(metrics.get('top_holding_pct', 0))}.",
                    f"- Sector allocation: {sectors or 'not available'}.",
                    "- Good diversification is about independent sources of return, not just owning many names.",
                    "",
                    "Recommendations:",
                    "- Keep single-stock, sector, and style exposures aligned with the investor mandate.",
                    "- Review whether the largest positions are intentional conviction bets or accidental concentration.",
                ]
            )
        if any(term in text for term in ["rebalance", "rebalancing"]):
            return "\n".join(
                [
                    "Summary:",
                    "Rebalancing brings the portfolio back toward its target allocation after market moves or cash flows change the weights.",
                    "",
                    "Key Insights:",
                    f"- Largest holding: {metrics.get('largest_holding') or 'not available'} at {self._pct(metrics.get('largest_holding_pct', 0))}.",
                    f"- Top sector: {metrics.get('top_sector') or 'not available'}.",
                    f"- Diversification score: {metrics.get('diversification_score', 0)}/100.",
                    "- Rebalancing should consider taxes, transaction costs, conviction, and minimum position sizes.",
                    "",
                    "Recommendations:",
                    "- Set target weights first, then trim exposures that exceed policy bands.",
                    "- Add to underweight areas only when the investment case and risk budget both support it.",
                ]
            )
        if any(term in text for term in ["allocation", "sector", "holding", "concentration"]):
            return "\n".join(
                [
                    "Summary:",
                    "Portfolio allocation describes where capital is deployed across holdings, sectors, and asset types.",
                    "",
                    "Key Insights:",
                    f"- Total value: {self._money(metrics.get('total_value', 0))}.",
                    f"- Holdings count: {metrics.get('holdings_count', 0)}.",
                    f"- Largest holding: {metrics.get('largest_holding') or 'not available'} ({self._pct(metrics.get('largest_holding_pct', 0))}).",
                    f"- Sector allocation: {sectors or 'not available'}.",
                    "",
                    "Recommendations:",
                    "- Check whether the current weights match the investor's goals, horizon, and risk tolerance.",
                    "- Flag any single holding above 25% or any sector that dominates the portfolio without a clear mandate.",
                ]
            )
        return "\n".join(
            [
                "Summary:",
                f"{self._portfolio_snapshot_line(context)}",
                "",
                "Key Insights:",
                f"- Diversification score: {metrics.get('diversification_score', 0)}/100.",
                f"- Top holding concentration: {self._pct(metrics.get('top_holding_pct', 0))}.",
                f"- Sector allocation: {sectors or 'not available'}.",
                "",
                "Recommendations:",
                "- Review allocation against target risk profile, time horizon, and liquidity needs.",
                "- Use rebalancing bands so portfolio changes are disciplined instead of reactive.",
            ]
        )

    def _insights(self, context: dict[str, Any]) -> list[str]:
        metrics = context.get("metrics", {})
        return [
            f"Portfolio value: {metrics.get('total_value', 0)}",
            f"Diversification score: {metrics.get('diversification_score', 0)}/100",
            f"Top holding concentration: {metrics.get('top_holding_pct', 0)}%",
        ]

    def _recommendations(self, context: dict[str, Any]) -> list[str]:
        metrics = context.get("metrics", {})
        recs = ["Review allocation against your target risk profile."]
        if metrics.get("top_holding_pct", 0) > 25:
            recs.append("Reduce single-position concentration below 25% where practical.")
        if metrics.get("diversification_score", 0) < 60:
            recs.append("Add exposure across more sectors to improve diversification.")
        return recs
