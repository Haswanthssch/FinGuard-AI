"""
ML Feature Engineering — Module 6
Converts raw analytics metrics dict into a feature vector for ML models.
"""
from __future__ import annotations
import numpy as np
import pandas as pd

FEATURE_COLS = [
    "annualized_return",
    "annualized_volatility",
    "sharpe_ratio",
    "sortino_ratio",
    "max_drawdown",
    "beta",
    "var_95",
    "cvar_95",
    "downside_deviation",
    "concentration_top3",
    "herfindahl_index",
    "diversification_entropy",
    "n_holdings",
]


def metrics_to_features(metrics: dict) -> np.ndarray:
    """Convert analytics metrics dict → 1D numpy feature vector."""
    return np.array([metrics.get(col, 0.0) or 0.0 for col in FEATURE_COLS], dtype=float)


def features_to_df(features_list: list[dict]) -> pd.DataFrame:
    """Convert list of metrics dicts → DataFrame with standard feature columns."""
    rows = []
    for m in features_list:
        row = {col: m.get(col, 0.0) or 0.0 for col in FEATURE_COLS}
        rows.append(row)
    return pd.DataFrame(rows, columns=FEATURE_COLS)
