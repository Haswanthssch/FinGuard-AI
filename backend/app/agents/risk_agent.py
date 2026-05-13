from typing import Any

from app.agents.base import BaseFinancialAgent
from app.agents.prompts import AGENT_PROMPTS


class RiskExposureAgent(BaseFinancialAgent):
    name = "risk"
    system_prompt = AGENT_PROMPTS["risk"]

    def _fallback(self, query: str, context: dict[str, Any]) -> str:
        text = self._normalize_query(query)
        metrics = context.get("metrics", {})
        if any(term in text for term in ["var", "value at risk"]):
            return "\n".join(
                [
                    "Summary:",
                    "VaR, or Value at Risk, estimates the loss that should not be exceeded over a chosen time horizon at a chosen confidence level.",
                    "",
                    "Key Insights:",
                    "- Example: 1-day 95% VaR of 2% means losses are expected to exceed 2% on roughly 5 out of 100 trading days, assuming the model is valid.",
                    "- VaR depends heavily on return history, volatility, correlations, and the method used.",
                    "- VaR does not tell you how bad losses can be beyond the threshold; pair it with expected shortfall and stress tests.",
                    f"- {self._portfolio_snapshot_line(context)}",
                    "",
                    "Recommendations:",
                    "- Use VaR for risk budgeting, but validate it with historical drawdowns and scenario losses.",
                ]
            )
        if "volatility" in text:
            return "\n".join(
                [
                    "Summary:",
                    "Volatility measures how much returns fluctuate. It is a core risk input, but it is not the same as permanent loss risk.",
                    "",
                    "Key Insights:",
                    f"- Current estimated annualized volatility: {self._pct(metrics.get('estimated_volatility', 0))}.",
                    f"- Current risk score: {metrics.get('risk_score', 0)}/10.",
                    "- Higher volatility can be acceptable if the expected return, horizon, and liquidity profile justify it.",
                    "",
                    "Recommendations:",
                    "- Compare volatility with drawdown, concentration, liquidity, and investor time horizon.",
                ]
            )
        if any(term in text for term in ["drawdown", "downside"]):
            return "\n".join(
                [
                    "Summary:",
                    "Drawdown is the fall from a prior peak to a later trough. It shows the pain an investor had to tolerate before recovery.",
                    "",
                    "Key Insights:",
                    "- Maximum drawdown is often more intuitive than volatility because it describes peak-to-trough loss.",
                    "- Downside risk focuses on harmful volatility rather than all volatility.",
                    "- Historical price series are required for precise portfolio drawdown.",
                    "",
                    "Recommendations:",
                    "- Use drawdown limits, position sizing, and diversification rules to manage downside exposure.",
                ]
            )
        if any(term in text for term in ["concentration", "liquidity", "stress"]):
            return "\n".join(
                [
                    "Summary:",
                    "Concentration, liquidity, and stress risk explain how the portfolio may behave when conditions are unfavorable.",
                    "",
                    "Key Insights:",
                    f"- Largest holding concentration: {self._pct(metrics.get('top_holding_pct', 0))}.",
                    f"- Top-3 concentration: {self._pct(metrics.get('concentration', {}).get('top_3_pct', 0))}.",
                    f"- Risk score: {metrics.get('risk_score', 0)}/10.",
                    "- Liquidity risk rises when positions cannot be reduced quickly without meaningful price impact.",
                    "",
                    "Recommendations:",
                    "- Stress test large holdings and sectors before adding more exposure.",
                    "- Maintain liquidity buffers when the portfolio has concentrated or volatile positions.",
                ]
            )
        return "\n".join(
            [
                "Summary:",
                f"{self._portfolio_snapshot_line(context)}",
                "",
                "Key Insights:",
                f"- Estimated annualized volatility: {self._pct(metrics.get('estimated_volatility', 0))}.",
                f"- Risk score: {metrics.get('risk_score', 0)}/10.",
                f"- Top holding concentration: {self._pct(metrics.get('top_holding_pct', 0))}.",
                "",
                "Recommendations:",
                "- Review concentration, downside risk, liquidity, and stress scenarios before increasing exposure.",
                "- Use historical data for production-grade VaR, beta, drawdown, and expected shortfall.",
            ]
        )

    def _insights(self, context: dict[str, Any]) -> list[str]:
        metrics = context.get("metrics", {})
        return [
            f"Estimated annualized volatility: {metrics.get('estimated_volatility', 0)}%",
            f"Risk score: {metrics.get('risk_score', 0)}/10",
        ]

    def _risk_observations(self, context: dict[str, Any]) -> list[str]:
        metrics = context.get("metrics", {})
        observations = ["VaR/liquidity estimates require historical price data for production precision."]
        if metrics.get("top_holding_pct", 0) > 25:
            observations.append("Single holding concentration is elevated.")
        if metrics.get("estimated_volatility", 0) > 25:
            observations.append("Return dispersion implies elevated volatility.")
        return observations

    def _recommendations(self, context: dict[str, Any]) -> list[str]:
        return ["Run stress tests before adding more exposure to concentrated positions."]
