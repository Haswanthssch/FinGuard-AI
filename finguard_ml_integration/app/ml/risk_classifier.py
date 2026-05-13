"""
Risk Classifier inference — v2
Handles both old (joblib) and new (pickle bundle) model formats.
"""
from __future__ import annotations
import os, logging, pickle, joblib
import numpy as np
from app.core.config import settings
from app.ml.features import FEATURE_COLS, metrics_to_features

logger = logging.getLogger(__name__)
MODEL_PATH   = os.path.join(settings.MODELS_DIR, "risk_classifier.pkl")
ENCODER_PATH = os.path.join(settings.MODELS_DIR, "risk_label_encoder.pkl")


def load_risk_classifier():
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Risk classifier not found at {MODEL_PATH}. Run scripts/train_all.py first.")
    with open(MODEL_PATH, "rb") as f:
        bundle = pickle.load(f)
    # v2 bundle: {"model": xgb, "label_encoder": le, ...}
    if isinstance(bundle, dict) and "model" in bundle:
        return bundle["model"], bundle["label_encoder"]
    # v1 legacy: raw XGBClassifier saved with joblib
    model = bundle
    le = joblib.load(ENCODER_PATH)
    return model, le


def predict_risk(metrics: dict) -> dict:
    model, le = load_risk_classifier()
    X = metrics_to_features(metrics).reshape(1, -1)
    pred_idx = model.predict(X)[0]
    proba    = model.predict_proba(X)[0]
    label    = le.inverse_transform([int(pred_idx)])[0]
    class_proba = {cls: round(float(p), 4) for cls, p in zip(le.classes_, proba)}
    return {
        "risk_category":      label,
        "confidence":         round(float(proba.max()), 4),
        "class_probabilities": class_proba,
    }
