from typing import Any

from app.schemas.aihub import AgentContribution


class BaseFinancialAgent:
    name: str = "base"
    system_prompt: str = ""

    async def run(self, query: str, context: dict[str, Any]) -> AgentContribution:
        output = self._fallback(query, context)
        return self._to_contribution(output, context)

    def _fallback(self, query: str, context: dict[str, Any]) -> str:
        return f"{self.name} analysis for: {query}"

    def _normalize_query(self, query: str) -> str:
        return " ".join(query.lower().strip().split())

    def _money(self, value: Any) -> str:
        try:
            return f"{float(value):,.2f}"
        except (TypeError, ValueError):
            return "0.00"

    def _pct(self, value: Any) -> str:
        try:
            return f"{float(value):.2f}%"
        except (TypeError, ValueError):
            return "0.00%"

    def _has_portfolio(self, context: dict[str, Any]) -> bool:
        return bool(context.get("metrics", {}).get("holdings_count", 0))

    def _portfolio_snapshot_line(self, context: dict[str, Any]) -> str:
        metrics = context.get("metrics", {})
        if not self._has_portfolio(context):
            return "No uploaded portfolio was available, so this answer is general education rather than holding-specific analysis."
        return (
            f"Using the uploaded portfolio: {metrics.get('holdings_count', 0)} holding(s), "
            f"total value {self._money(metrics.get('total_value', 0))}, "
            f"total return {self._pct(metrics.get('total_pnl_pct', 0))}."
        )

    def _to_contribution(self, output: str, context: dict[str, Any]) -> AgentContribution:
        return AgentContribution(
            agent=self.name,
            summary=output.split("\n")[0][:500] if output else f"{self.name} completed analysis.",
            insights=self._insights(context),
            recommendations=self._recommendations(context),
            risk_observations=self._risk_observations(context),
            confidence=0.78,
            raw_output=output,
        )

    def _insights(self, context: dict[str, Any]) -> list[str]:
        return []

    def _recommendations(self, context: dict[str, Any]) -> list[str]:
        return []

    def _risk_observations(self, context: dict[str, Any]) -> list[str]:
        return []
