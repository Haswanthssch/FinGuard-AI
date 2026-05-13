"""
Unified ML Inference API
Single entry point for all three models.
"""
from __future__ import annotations
import logging

logger = logging.getLogger(__name__)


def run_all_inference(metrics: dict) -> dict:
    """Run risk classifier, archetype clustering, and stress regressor."""
    output = {}

    # Risk Classification
    try:
        from .risk_classifier import predict_risk
        output["risk"] = predict_risk(metrics)
    except FileNotFoundError:
        output["risk"] = {"risk_category": "Conservative", "confidence": 0.0, "note": "Model not found"}
    except Exception as e:
        logger.error("Risk inference error: %s", e)
        output["risk"] = {"error": str(e)}

    # Archetype Clustering
    try:
        from .archetype_cluster import predict_archetype
        output["archetype"] = predict_archetype(metrics)
    except FileNotFoundError:
        output["archetype"] = {"archetype": "Diversified", "confidence": 0.0, "note": "Model not found"}
    except Exception as e:
        logger.error("Archetype inference error: %s", e)
        output["archetype"] = {"error": str(e)}

    # Stress Vulnerability
    try:
        from .stress_regressor import predict_stress
        output["stress_vulnerability"] = predict_stress(metrics)
    except FileNotFoundError:
        output["stress_vulnerability"] = {"note": "Model not found"}
    except Exception as e:
        logger.error("Stress inference error: %s", e)
        output["stress_vulnerability"] = {"error": str(e)}

    return output
