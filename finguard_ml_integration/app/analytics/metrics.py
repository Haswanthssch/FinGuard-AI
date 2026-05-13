"""
Portfolio Analytics Engine — Module 4 (metrics.py)
Computes all quantitative portfolio metrics from returns and weights.
"""
from __future__ import annotations

import numpy as np
import pandas as pd
from scipy import stats

TRADING_DAYS = 252
RISK_FREE_RATE = 0.068  # 6.8% — approx India 10yr Gsec


def _weights_from_holdings(holdings: list[dict]) -> tuple[np.ndarray, list[str]]:
    vals = np.array([h.get("current_value") or h.get("invested_value") or 0.0
                     for h in holdings], dtype=float)
    total = vals.sum()
    if total == 0:
        n = len(holdings)
        return np.ones(n) / n, [h.get("symbol", h["asset_name"]) for h in holdings]
    return vals / total, [h.get("symbol") or h.get("asset_name", "?") for h in holdings]


def portfolio_returns(returns_matrix: pd.DataFrame, weights: np.ndarray) -> pd.Series:
    """Compute weighted daily portfolio returns."""
    cols = returns_matrix.columns.tolist()
    w = pd.Series(weights, index=cols) if len(weights) == len(cols) else pd.Series(
        np.ones(len(cols)) / len(cols), index=cols)
    return returns_matrix.fillna(0).dot(w)


def annualized_return(port_returns: pd.Series) -> float:
    total = (1 + port_returns.dropna()).prod()
    n_years = len(port_returns.dropna()) / TRADING_DAYS
    if n_years <= 0:
        return 0.0
    return float(total ** (1 / n_years) - 1)


def annualized_volatility(port_returns: pd.Series) -> float:
    return float(port_returns.dropna().std() * np.sqrt(TRADING_DAYS))


def sharpe_ratio(port_returns: pd.Series, rfr: float = RISK_FREE_RATE) -> float:
    ann_ret = annualized_return(port_returns)
    ann_vol = annualized_volatility(port_returns)
    return float((ann_ret - rfr) / ann_vol) if ann_vol > 0 else 0.0


def sortino_ratio(port_returns: pd.Series, rfr: float = RISK_FREE_RATE) -> float:
    daily_rfr = rfr / TRADING_DAYS
    downside = port_returns[port_returns < daily_rfr].dropna()
    downside_std = downside.std() * np.sqrt(TRADING_DAYS)
    ann_ret = annualized_return(port_returns)
    return float((ann_ret - rfr) / downside_std) if downside_std > 0 else 0.0


def max_drawdown(port_returns: pd.Series) -> float:
    cumulative = (1 + port_returns.fillna(0)).cumprod()
    rolling_max = cumulative.cummax()
    drawdown = (cumulative - rolling_max) / rolling_max
    return float(drawdown.min())


def rolling_drawdown(port_returns: pd.Series, window: int = 252) -> pd.Series:
    cumulative = (1 + port_returns.fillna(0)).cumprod()
    rolling_max = cumulative.rolling(window=window, min_periods=1).max()
    return (cumulative - rolling_max) / rolling_max


def value_at_risk(port_returns: pd.Series, confidence: float = 0.95) -> float:
    """Historical VaR at given confidence level (daily, as positive loss %)."""
    return float(-np.percentile(port_returns.dropna(), (1 - confidence) * 100))


def conditional_var(port_returns: pd.Series, confidence: float = 0.95) -> float:
    """CVaR / Expected Shortfall."""
    var = value_at_risk(port_returns, confidence)
    tail = port_returns[port_returns <= -var].dropna()
    return float(-tail.mean()) if not tail.empty else var


def beta(port_returns: pd.Series, benchmark: pd.Series) -> float:
    aligned = pd.concat([port_returns, benchmark], axis=1).dropna()
    if aligned.empty or aligned.shape[0] < 30:
        return 1.0
    cov_matrix = np.cov(aligned.iloc[:, 0], aligned.iloc[:, 1])
    bench_var = cov_matrix[1, 1]
    return float(cov_matrix[0, 1] / bench_var) if bench_var > 0 else 1.0


def downside_deviation(port_returns: pd.Series, mar: float = 0.0) -> float:
    daily_mar = mar / TRADING_DAYS
    downside = port_returns[port_returns < daily_mar] - daily_mar
    return float(np.sqrt((downside ** 2).mean()) * np.sqrt(TRADING_DAYS))


def concentration_ratio(weights: np.ndarray, top_n: int = 3) -> float:
    """Sum of top-N holdings weight (HHI-style concentration)."""
    sorted_w = np.sort(weights)[::-1]
    return float(sorted_w[:top_n].sum())


def herfindahl_index(weights: np.ndarray) -> float:
    """Herfindahl-Hirschman Index — portfolio concentration."""
    return float((weights ** 2).sum())


def diversification_entropy(weights: np.ndarray) -> float:
    """Shannon entropy of weights (higher = more diversified)."""
    w = weights[weights > 0]
    return float(-np.sum(w * np.log(w))) if len(w) > 0 else 0.0


def compute_all_metrics(
    holdings: list[dict],
    returns_matrix: pd.DataFrame,
    benchmark: pd.Series,
) -> dict:
    """Compute complete portfolio metrics bundle."""
    weights, names = _weights_from_holdings(holdings)

    # Align weights to available columns
    avail = [n for n in names if n in returns_matrix.columns]
    w_aligned = np.array([weights[names.index(n)] for n in avail], dtype=float)
    w_aligned = w_aligned / w_aligned.sum() if w_aligned.sum() > 0 else w_aligned

    sub_matrix = returns_matrix[avail]
    port_ret = portfolio_returns(sub_matrix, w_aligned)

    rd = rolling_drawdown(port_ret)

    return {
        "annualized_return":       round(annualized_return(port_ret) * 100, 3),
        "annualized_volatility":   round(annualized_volatility(port_ret) * 100, 3),
        "sharpe_ratio":            round(sharpe_ratio(port_ret), 4),
        "sortino_ratio":           round(sortino_ratio(port_ret), 4),
        "max_drawdown":            round(max_drawdown(port_ret) * 100, 3),
        "beta":                    round(beta(port_ret, benchmark), 4),
        "var_95":                  round(value_at_risk(port_ret) * 100, 3),
        "cvar_95":                 round(conditional_var(port_ret) * 100, 3),
        "downside_deviation":      round(downside_deviation(port_ret) * 100, 3),
        "concentration_top3":      round(concentration_ratio(w_aligned, 3) * 100, 2),
        "herfindahl_index":        round(herfindahl_index(w_aligned), 5),
        "diversification_entropy": round(diversification_entropy(w_aligned), 5),
        "n_holdings":              len(holdings),
        "portfolio_returns_series": port_ret.tail(252).tolist(),
        "rolling_drawdown_series":  rd.tail(252).tolist(),
        "dates_series":             [str(d.date()) for d in port_ret.tail(252).index],
    }
