import math
from dataclasses import dataclass
from datetime import date
from typing import Any

import numpy as np
import pandas as pd


@dataclass
class PortfolioAnalytics:
    total_value: float
    total_cost: float
    total_pnl: float
    total_pnl_pct: float
    holdings_count: int
    sector_allocation: dict[str, float]
    top_holding_pct: float
    diversification_score: float
    estimated_volatility: float
    risk_score: float
    cagr: float
    top_sector: str | None
    largest_holding: str | None
    largest_holding_pct: float
    high_risk_exposure: bool
    top_holdings: list[dict[str, Any]]
    top_gainers: list[dict[str, Any]]
    top_losers: list[dict[str, Any]]
    concentration: dict[str, Any]


class AnalyticsService:
    def compute(self, holdings: list[dict[str, Any]]) -> PortfolioAnalytics:
        if not holdings:
            return PortfolioAnalytics(0, 0, 0, 0, 0, {}, 0, 0, 0, 0, 0, None, None, 0, False, [], [], [], {})

        df = pd.DataFrame(holdings)
        df["quantity"] = pd.to_numeric(df.get("quantity", 0), errors="coerce").fillna(0)
        if "purchase_price" not in df and "average_buy_price" in df:
            df["purchase_price"] = df["average_buy_price"]
        if "current_price" not in df and "closing_price" in df:
            df["current_price"] = df["closing_price"]
        if "value" not in df and "closing_value" in df:
            df["value"] = df["closing_value"]
        if "cost" not in df and "buy_value" in df:
            df["cost"] = df["buy_value"]

        df["purchase_price"] = pd.to_numeric(df.get("purchase_price", 0), errors="coerce").fillna(0)
        df["current_price"] = pd.to_numeric(
            df.get("current_price", df["purchase_price"]),
            errors="coerce",
        ).fillna(df["purchase_price"])
        df["cost"] = pd.to_numeric(df.get("cost", df["quantity"] * df["purchase_price"]), errors="coerce").fillna(
            df["quantity"] * df["purchase_price"]
        )
        df["value"] = pd.to_numeric(df.get("value", df["quantity"] * df["current_price"]), errors="coerce").fillna(
            df["quantity"] * df["current_price"]
        )
        df["pnl"] = pd.to_numeric(df.get("unrealized_pnl", df["value"] - df["cost"]), errors="coerce").fillna(
            df["value"] - df["cost"]
        )
        df["pnl_pct"] = np.where(df["cost"] > 0, df["pnl"] / df["cost"] * 100, 0)

        total_cost = float(df["cost"].sum())
        total_value = float(df["value"].sum())
        total_pnl = float(df["pnl"].sum()) if "pnl" in df else total_value - total_cost
        total_pnl_pct = (total_pnl / total_cost * 100) if total_cost else 0

        sector_series = df.groupby(df.get("sector", "Others").fillna("Others"))["value"].sum()
        sector_allocation = {
            str(sector): round(float(value / total_value * 100), 2)
            for sector, value in sector_series.items()
        } if total_value else {}
        top_sector = max(sector_allocation, key=sector_allocation.get) if sector_allocation else None

        weights = (df["value"] / total_value).replace([np.inf, -np.inf], 0).fillna(0) if total_value else pd.Series([])
        top_holding_pct = round(float(weights.max() * 100), 2) if len(weights) else 0
        largest_idx = weights.idxmax() if len(weights) else None
        largest_holding = str(df.loc[largest_idx].get("stock_name") or df.loc[largest_idx].get("symbol")) if largest_idx is not None else None
        herfindahl = float((weights**2).sum()) if len(weights) else 1
        diversification_score = round(max(0, min(100, (1 - herfindahl) * 125)), 2)

        returns = ((df["current_price"] - df["purchase_price"]) / df["purchase_price"]).replace(
            [np.inf, -np.inf],
            0,
        ).fillna(0)
        estimated_volatility = round(float(np.std(returns) * math.sqrt(252) * 100), 2) if len(returns) > 1 else 12.0
        risk_score = round(min(10, (100 - diversification_score) / 12 + top_holding_pct / 20 + estimated_volatility / 25), 2)
        cagr = self._estimate_cagr(df, total_value, total_cost)
        top_holdings = self._records(df.sort_values("value", ascending=False).head(5))
        top_gainers = self._records(df.sort_values("pnl", ascending=False).head(5))
        top_losers = self._records(df.sort_values("pnl", ascending=True).head(5))
        concentration = {
            "top_holding_pct": top_holding_pct,
            "top_3_pct": round(float(weights.sort_values(ascending=False).head(3).sum() * 100), 2) if len(weights) else 0,
            "sector_count": len(sector_allocation),
            "largest_holding": largest_holding,
            "top_sector": top_sector,
        }

        return PortfolioAnalytics(
            total_value=round(total_value, 2),
            total_cost=round(total_cost, 2),
            total_pnl=round(total_pnl, 2),
            total_pnl_pct=round(total_pnl_pct, 2),
            holdings_count=int(len(df)),
            sector_allocation=sector_allocation,
            top_holding_pct=top_holding_pct,
            diversification_score=diversification_score,
            estimated_volatility=estimated_volatility,
            risk_score=risk_score,
            cagr=cagr,
            top_sector=top_sector,
            largest_holding=largest_holding,
            largest_holding_pct=top_holding_pct,
            high_risk_exposure=risk_score >= 7 or top_holding_pct >= 30,
            top_holdings=top_holdings,
            top_gainers=top_gainers,
            top_losers=top_losers,
            concentration=concentration,
        )

    def _estimate_cagr(self, df: pd.DataFrame, total_value: float, total_cost: float) -> float:
        if not total_cost:
            return 0
        if "purchase_date" not in df:
            return round((total_value / total_cost - 1) * 100, 2)
        dates = pd.to_datetime(df["purchase_date"], errors="coerce").dropna()
        if dates.empty:
            return round((total_value / total_cost - 1) * 100, 2)
        years = max((pd.Timestamp(date.today()) - dates.min()).days / 365.25, 0.25)
        return round(((total_value / total_cost) ** (1 / years) - 1) * 100, 2)

    def _records(self, df: pd.DataFrame) -> list[dict[str, Any]]:
        fields = [
            "stock_name", "symbol", "isin", "sector", "asset_type", "quantity",
            "purchase_price", "current_price", "cost", "value", "pnl", "pnl_pct",
        ]
        records = []
        for record in df.replace([np.inf, -np.inf], 0).fillna("").to_dict(orient="records"):
            records.append({
                key: round(float(record[key]), 2) if isinstance(record.get(key), (int, float, np.floating)) else record.get(key)
                for key in fields
                if key in record
            })
        return records


analytics_service = AnalyticsService()
