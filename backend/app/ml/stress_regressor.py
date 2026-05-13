"""
Stress Vulnerability Regressor inference — v2
"""
from __future__ import annotations
import os, logging, pickle, joblib
import numpy as np
from app.core.config import settings
from .features import FEATURE_COLS, metrics_to_features

logger = logging.getLogger(__name__)
MODEL_PATH = os.path.join(str(settings.MODELS_DIR), "stress_regressor.pkl")

SCENARIO_MAP = {
    "covid_drawdown":     ("covid_crash_expected_drawdown_pct",    "COVID Crash"),
    "inflation_drawdown": ("inflation_shock_expected_drawdown_pct", "Inflation Shock"),
    "tech_drawdown":      ("tech_selloff_expected_drawdown_pct",    "Tech Selloff"),
    "banking_drawdown":   ("banking_crisis_expected_drawdown_pct",  "Banking Crisis"),
}


def load_stress_regressor() -> dict:
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Stress model not found at {MODEL_PATH}")
    with open(MODEL_PATH, "rb") as f:
        bundle = pickle.load(f)
    if isinstance(bundle, dict) and "models" in bundle:
        return bundle["models"]
    return bundle


def predict_stress(metrics: dict) -> dict:
    regressors = load_stress_regressor()
    X = metrics_to_features(metrics).reshape(1, -1)

    result = {}
    predictions: dict[str, float] = {}

    for target, (out_key, label) in SCENARIO_MAP.items():
        if target in regressors:
            val = float(regressors[target].predict(X)[0])
            result[out_key] = round(val, 2)
            predictions[label] = val
        else:
            result[out_key] = None

    if predictions:
        worst = min(predictions, key=predictions.get)
        result["worst_case_scenario"] = worst
    else:
        result["worst_case_scenario"] = "N/A"

    return result
