"""
Portfolio Analytics Engine — v2
Computes advanced metrics for ML input.
"""
from __future__ import annotations
import numpy as np
import pandas as pd
from scipy import stats

TRADING_DAYS = 252
RISK_FREE_RATE = 0.068  # 6.8% — approx India 10yr Gsec


def _weights_from_holdings(holdings: list[dict]) -> tuple[np.ndarray, list[str]]:
    vals = np.array([float(h.get("closing_value") or h.get("buy_value") or 0.0)
                     for h in holdings], dtype=float)
    total = vals.sum()
    if total == 0:
        n = len(holdings)
        return np.ones(n) / n if n > 0 else np.array([]), [h.get("symbol") or h.get("stock_name", "?") for h in holdings]
    return vals / total, [h.get("symbol") or h.get("stock_name", "?") for h in holdings]


def compute_all_metrics(
    holdings: list[dict],
) -> dict:
    """Compute portfolio metrics bundle for ML."""
    weights, names = _weights_from_holdings(holdings)
    
    # Since we don't have historical returns in this simple integration,
    # we will derive some metrics from available data or provide defaults.
    # In a real system, we would fetch historical data here.
    
    # DERIVED / FALLBACK METRICS
    # Many ML features like annualized_return, sharpe, etc. require historical price series.
    # For now, we calculate what we can from current holdings.
    
    # Total PnL Pct can be a proxy for return if holding period known, but here we use it as is.
    total_value = sum(float(h.get("closing_value") or 0) for h in holdings)
    total_cost = sum(float(h.get("buy_value") or 0) for h in holdings)
    total_pnl_pct = (total_value / total_cost - 1) if total_cost > 0 else 0.0
    
    # Concentration metrics
    sorted_w = np.sort(weights)[::-1]
    concentration_top3 = float(sorted_w[:3].sum()) * 100
    herfindahl = float((weights ** 2).sum())
    
    # Entropy
    w_pos = weights[weights > 0]
    entropy = float(-np.sum(w_pos * np.log(w_pos))) if len(w_pos) > 0 else 0.0
    
    # Dummy values for time-series dependent metrics if not available
    # In production, these should be calculated from historical price data.
    return {
        "annualized_return":       round(total_pnl_pct * 100, 3), # Proxy
        "annualized_volatility":   15.5, # Placeholder
        "sharpe_ratio":            round(total_pnl_pct / 0.15, 4) if total_pnl_pct > 0 else 0.0, # Proxy
        "sortino_ratio":           0.8,
        "max_drawdown":            -12.0,
        "beta":                    1.05,
        "var_95":                  2.1,
        "cvar_95":                 3.2,
        "downside_deviation":      8.5,
        "concentration_top3":      round(concentration_top3, 2),
        "herfindahl_index":        round(herfindahl, 5),
        "diversification_entropy": round(entropy, 5),
        "n_holdings":              len(holdings),
    }
