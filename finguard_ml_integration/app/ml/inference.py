"""
Unified ML Inference API — Module 6
Single entry point for all three models.
"""
from __future__ import annotations
import logging

logger = logging.getLogger(__name__)


def run_all_inference(metrics: dict) -> dict:
    """Run risk classifier, archetype clustering, and stress regressor."""
    output = {}

    try:
        from app.ml.risk_classifier import predict_risk
        output["risk"] = predict_risk(metrics)
    except FileNotFoundError:
        output["risk"] = {"risk_category": "Models not trained yet", "confidence": 0.0}
    except Exception as e:
        logger.error("Risk inference error: %s", e)
        output["risk"] = {"error": str(e)}

    try:
        from app.ml.archetype_cluster import predict_archetype
        output["archetype"] = predict_archetype(metrics)
    except FileNotFoundError:
        output["archetype"] = {"archetype": "Models not trained yet", "confidence": 0.0}
    except Exception as e:
        logger.error("Archetype inference error: %s", e)
        output["archetype"] = {"error": str(e)}

    try:
        from app.ml.stress_regressor import predict_stress
        output["stress_vulnerability"] = predict_stress(metrics)
    except FileNotFoundError:
        output["stress_vulnerability"] = {"note": "Models not trained yet"}
    except Exception as e:
        logger.error("Stress inference error: %s", e)
        output["stress_vulnerability"] = {"error": str(e)}

    return output
