"""
Portfolio Archetype Classifier — v2
Supervised XGBoost classifier on archetype labels.
GMM provides soft probability distribution over archetypes.
Handles both v2 bundle (classifier key) and legacy (kmeans key).
"""
from __future__ import annotations
import os, logging, pickle
import numpy as np
from app.core.config import settings
from app.ml.features import FEATURE_COLS, metrics_to_features

logger = logging.getLogger(__name__)
MODEL_PATH = os.path.join(settings.MODELS_DIR, "archetype_clusterer.pkl")


def load_archetype_clusterer():
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Archetype model not found at {MODEL_PATH}. Run scripts/train_all.py first.")
    with open(MODEL_PATH, "rb") as f:
        bundle = pickle.load(f)
    return bundle


def predict_archetype(metrics: dict) -> dict:
    bundle = load_archetype_clusterer()
    X = metrics_to_features(metrics).reshape(1, -1)

    archetype_names = bundle.get("archetype_names", [])

    # ── v2: supervised XGBoost classifier ────────────────────────
    if "classifier" in bundle:
        clf = bundle["classifier"]
        le  = bundle["label_encoder"]
        pred_idx = int(clf.predict(X)[0])
        proba    = clf.predict_proba(X)[0]
        archetype = le.inverse_transform([pred_idx])[0]
        proba_dict = {cls: round(float(p), 4)
                      for cls, p in zip(le.classes_, proba)}
        confidence = round(float(proba.max()), 4)

    # ── legacy: KMeans + GMM ──────────────────────────────────────
    else:
        scaler = bundle["scaler"]
        pca    = bundle["pca"]
        kmeans = bundle.get("kmeans")
        gmm    = bundle.get("gmm")
        cluster_to_arch = bundle.get("cluster_to_archetype", {})

        X_scaled = scaler.transform(X)
        X_pca    = pca.transform(X_scaled)

        cluster_idx = int(kmeans.predict(X_pca)[0])
        archetype   = cluster_to_arch.get(cluster_idx, "Diversified")
        gmm_proba   = gmm.predict_proba(X_pca)[0]
        proba_dict  = {cluster_to_arch.get(i, f"Cluster {i}"): round(float(p), 4)
                       for i, p in enumerate(gmm_proba)}
        confidence  = round(float(gmm_proba.max()), 4)

    return {
        "archetype":               archetype,
        "confidence":              confidence,
        "archetype_probabilities": proba_dict,
    }
