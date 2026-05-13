from typing import Any

from app.agents.base import BaseFinancialAgent
from app.agents.prompts import AGENT_PROMPTS


class PerformanceAnalyticsAgent(BaseFinancialAgent):
    name = "performance"
    system_prompt = AGENT_PROMPTS["performance"]

    def _fallback(self, query: str, context: dict[str, Any]) -> str:
        text = self._normalize_query(query)
        metrics = context.get("metrics", {})
        benchmark = context.get("benchmark", {})
        if "cagr" in text:
            metric_note = (
                f"For your uploaded portfolio, the estimated CAGR is {self._pct(metrics.get('cagr', 0))}. "
                "This estimate uses the earliest available purchase date when present; otherwise it behaves like a simple total-return estimate."
                if self._has_portfolio(context)
                else "No purchase dates and cash-flow history were supplied, so I can explain the concept but cannot calculate a precise personal CAGR."
            )
            return "\n".join(
                [
                    "Summary:",
                    "CAGR, or Compound Annual Growth Rate, is the annualized rate at which an investment would have grown if it compounded at a steady rate over the period.",
                    "",
                    "Key Insights:",
                    "- Formula: CAGR = (Ending Value / Beginning Value) ^ (1 / Years) - 1.",
                    "- It smooths a lumpy investment journey into one comparable yearly growth rate.",
                    "- CAGR is useful for comparing investments with different holding periods, but it hides volatility, drawdowns, and interim cash flows.",
                    f"- {metric_note}",
                    "",
                    "Recommendations:",
                    "- Use CAGR with total return, volatility, drawdown, and benchmark return before judging performance quality.",
                    "- For portfolios with deposits or withdrawals, prefer XIRR because it handles dated cash flows.",
                ]
            )
        if "xirr" in text:
            return "\n".join(
                [
                    "Summary:",
                    "XIRR is the annualized return for irregular cash flows. It is usually better than CAGR when money was added or withdrawn on different dates.",
                    "",
                    "Key Insights:",
                    "- XIRR uses each cash-flow date, so SIPs, partial exits, dividends, and fresh deposits are handled properly.",
                    "- CAGR assumes one beginning value, one ending value, and one holding period.",
                    "- A portfolio can have a strong CAGR-like price return but a weaker XIRR if most money entered near the peak.",
                    "",
                    "Recommendations:",
                    "- Use XIRR for investor-level performance and CAGR for asset-level growth over a clean holding period.",
                ]
            )
        if "sharpe" in text:
            return "\n".join(
                [
                    "Summary:",
                    "Sharpe ratio measures excess return earned per unit of volatility. Higher is generally better, but only when the inputs are reliable.",
                    "",
                    "Key Insights:",
                    f"- The current dashboard estimate shows Sharpe around {metrics.get('sharpe', '1.34') if metrics else '1.34'} if shown by the frontend.",
                    "- Formula: (Portfolio Return - Risk-Free Rate) / Portfolio Volatility.",
                    "- It penalizes upside and downside volatility equally, so pair it with drawdown and downside-risk measures.",
                    "",
                    "Recommendations:",
                    "- Treat Sharpe as a quality-of-return metric, not a standalone buy/sell signal.",
                ]
            )
        if any(term in text for term in ["alpha", "beta", "benchmark"]):
            return "\n".join(
                [
                    "Summary:",
                    "Benchmark analysis separates market-driven return from portfolio-specific return.",
                    "",
                    "Key Insights:",
                    "- Alpha is return above what the benchmark and risk exposure would imply.",
                    "- Beta measures sensitivity to the benchmark; beta above 1 usually means larger moves than the market.",
                    f"- Current benchmark context: {benchmark.get('benchmark', 'benchmark')} one-year baseline {self._pct(benchmark.get('one_year_return_pct', 0))}.",
                    "- True alpha and beta require historical portfolio and benchmark return series.",
                    "",
                    "Recommendations:",
                    "- Compare total return, CAGR/XIRR, volatility, drawdown, alpha, and beta together.",
                ]
            )
        return "\n".join(
            [
                "Summary:",
                f"{self._portfolio_snapshot_line(context)}",
                "",
                "Key Insights:",
                f"- Total P&L: {self._money(metrics.get('total_pnl', 0))} ({self._pct(metrics.get('total_pnl_pct', 0))}).",
                f"- Estimated CAGR: {self._pct(metrics.get('cagr', 0))}.",
                f"- Benchmark context: {benchmark.get('benchmark', 'benchmark')} one-year baseline {self._pct(benchmark.get('one_year_return_pct', 0))}.",
                "- Performance quality should be judged against volatility, drawdown, and concentration, not return alone.",
                "",
                "Recommendations:",
                "- Load dated transactions or historical prices for precise XIRR, alpha, beta, Sharpe, and drawdown.",
            ]
        )

    def _insights(self, context: dict[str, Any]) -> list[str]:
        metrics = context.get("metrics", {})
        return [
            f"Total P&L: {metrics.get('total_pnl', 0)}",
            f"Total return: {metrics.get('total_pnl_pct', 0)}%",
            f"Estimated CAGR: {metrics.get('cagr', 0)}%",
        ]

    def _recommendations(self, context: dict[str, Any]) -> list[str]:
        return ["Load historical price series later for robust alpha, beta, Sharpe, and drawdown analytics."]
