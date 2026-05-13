from fastapi import APIRouter, Query

router = APIRouter(prefix="/market", tags=["market"])


_STATIC_QUOTES = {
    "^NSEI": {"price": 22530.7, "change": 118.25, "percent_change": 0.53},
    "^BSESN": {"price": 74221.1, "change": 312.4, "percent_change": 0.42},
    "RELIANCE.NS": {"price": 2750.0, "change": 18.5, "percent_change": 0.68},
    "AAPL": {"price": 182.6, "change": -1.2, "percent_change": -0.65},
    "BTC-USD": {"price": 64250.0, "change": 830.0, "percent_change": 1.31},
    "ETH-USD": {"price": 3150.0, "change": 42.0, "percent_change": 1.35},
    "GC=F": {"price": 2340.4, "change": 8.1, "percent_change": 0.35},
    "SI=F": {"price": 29.2, "change": -0.11, "percent_change": -0.38},
    "CL=F": {"price": 79.8, "change": 0.64, "percent_change": 0.81},
    "INR=X": {"price": 83.42, "change": -0.03, "percent_change": -0.04},
    "QQQ": {"price": 445.8, "change": 2.1, "percent_change": 0.47},
}


def _quote(symbol: str) -> dict:
    base = _STATIC_QUOTES.get(symbol.upper()) or _STATIC_QUOTES.get(symbol)
    if not base:
        seed = sum(ord(char) for char in symbol)
        price = round(100 + (seed % 900) + (seed % 17) / 10, 2)
        change = round(((seed % 21) - 10) / 5, 2)
        percent_change = round(change / price * 100, 2)
        base = {"price": price, "change": change, "percent_change": percent_change}
    return {
        "symbol": symbol,
        "price": base["price"],
        "change": base["change"],
        "percent_change": base["percent_change"],
        "trend": "up" if base["change"] >= 0 else "down",
    }


@router.get("/quotes")
async def get_quotes(symbols: str = Query(..., description="Comma-separated symbols")):
    return [_quote(symbol.strip()) for symbol in symbols.split(",") if symbol.strip()]


@router.get("/quote")
async def get_quote(symbol: str = Query(...)):
    return _quote(symbol.strip())

