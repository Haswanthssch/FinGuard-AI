from typing import Any
from app.ml.inference import run_all_inference
from app.ml.metrics_v2 import compute_all_metrics

class MLService:
    def analyze_portfolio(self, holdings: list[dict[str, Any]]) -> dict[str, Any]:
        """
        Runs full ML suite on portfolio holdings.
        1. Computes necessary features.
        2. Runs inference for risk category, archetype, and stress tests.
        """
        if not holdings:
            return {
                "risk": {"risk_category": "N/A", "confidence": 0},
                "archetype": {"archetype": "N/A", "confidence": 0},
                "stress_vulnerability": {}
            }

        # Step 1: Compute features
        metrics = compute_all_metrics(holdings)
        
        # Step 2: Run inference
        results = run_all_inference(metrics)
        
        return results

ml_service = MLService()
