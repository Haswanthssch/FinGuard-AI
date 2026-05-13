class MarketService:
    def benchmark_snapshot(self, benchmark: str = "NIFTY 50") -> dict:
        return {
            "benchmark": benchmark,
            "one_year_return_pct": 11.0,
            "risk_free_rate_pct": 6.5,
            "data_source": "static_local_baseline",
        }


market_service = MarketService()

