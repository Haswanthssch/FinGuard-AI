from io import BytesIO
from pathlib import Path
from typing import Any

import pandas as pd
from fastapi import HTTPException, UploadFile, status


class PortfolioParser:
    COLUMN_ALIASES = {
        "stock_name": {
            "stock name", "stock", "security", "security name", "scrip", "scrip name",
            "company", "company name", "symbol", "name",
        },
        "isin": {"isin", "isin code"},
        "quantity": {"quantity", "qty", "shares", "units", "holding qty"},
        "average_buy_price": {
            "avg buy price", "average buy price", "avg. buy price", "buy avg",
            "average price", "purchase price", "avg cost", "cost price",
        },
        "buy_value": {"buy value", "investment value", "cost value", "invested value", "purchase value"},
        "closing_price": {"closing price", "close price", "current price", "market price", "ltp", "last traded price"},
        "closing_value": {"closing value", "current value", "market value", "value"},
        "unrealized_pnl": {
            "unrealised p&l", "unrealized p&l", "unrealised pnl", "unrealized pnl",
            "p&l", "pnl", "profit/loss", "unrealised profit/loss",
        },
        "sector": {"sector", "industry"},
        "asset_type": {"asset type", "instrument type", "type"},
        "exchange": {"exchange", "market"},
    }

    REQUIRED = {"stock_name", "quantity"}

    async def parse_upload(self, file: UploadFile) -> list[dict[str, Any]]:
        filename = file.filename or "portfolio"
        content = await file.read()
        return self.parse_content(filename, content)

    def parse_content(self, filename: str, content: bytes) -> list[dict[str, Any]]:
        suffix = Path(filename or "portfolio").suffix.lower()
        if not content:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty")

        if suffix == ".csv":
            df = pd.read_csv(BytesIO(content), sep=None, engine="python")
        elif suffix in {".xlsx", ".xls"}:
            df = pd.read_excel(BytesIO(content), engine="openpyxl")
        else:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only CSV and XLSX files are supported")

        return self.normalize_dataframe(df)

    def normalize_dataframe(self, df: pd.DataFrame) -> list[dict[str, Any]]:
        if df.empty:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Portfolio file has no rows")

        df = self._coerce_header(df)
        df = df.rename(columns={column: self._canonical_column(column) for column in df.columns})
        missing = [column for column in self.REQUIRED if column not in df.columns]
        if missing:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={
                    "message": f"Missing required portfolio columns: {', '.join(missing)}",
                    "detected_columns": [str(column) for column in df.columns],
                    "supported_columns": sorted({alias for aliases in self.COLUMN_ALIASES.values() for alias in aliases}),
                },
            )

        rows: list[dict[str, Any]] = []
        for _, raw in df.iterrows():
            row = {key: self._clean_value(raw.get(key)) for key in self.COLUMN_ALIASES}
            if not row.get("stock_name"):
                continue
            quantity = self._number(row.get("quantity"))
            avg_buy = self._number(row.get("average_buy_price"))
            buy_value = self._number(row.get("buy_value"))
            closing_price = self._number(row.get("closing_price"))
            closing_value = self._number(row.get("closing_value"))
            unrealized_pnl = self._number(row.get("unrealized_pnl"))

            if not avg_buy and quantity and buy_value:
                avg_buy = buy_value / quantity
            if not buy_value and quantity and avg_buy:
                buy_value = quantity * avg_buy
            if not closing_price and quantity and closing_value:
                closing_price = closing_value / quantity
            if not closing_value and quantity and closing_price:
                closing_value = quantity * closing_price
            if unrealized_pnl == 0 and closing_value and buy_value:
                unrealized_pnl = closing_value - buy_value
            if not closing_price:
                closing_price = avg_buy
            if not closing_value:
                closing_value = quantity * closing_price

            rows.append(
                {
                    "stock_name": str(row["stock_name"]).strip(),
                    "isin": str(row["isin"]).strip() if row.get("isin") else None,
                    "quantity": quantity,
                    "average_buy_price": avg_buy,
                    "buy_value": buy_value,
                    "closing_price": closing_price,
                    "closing_value": closing_value,
                    "unrealized_pnl": unrealized_pnl,
                    "sector": str(row["sector"]).strip() if row.get("sector") else self._infer_sector(str(row["stock_name"])),
                    "asset_type": str(row["asset_type"]).strip() if row.get("asset_type") else "Equity",
                    "exchange": str(row["exchange"]).strip() if row.get("exchange") else "NSE",
                }
            )

        if not rows:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="No valid holdings found")
        return rows

    def _canonical_column(self, column: str) -> str:
        normalized = self._normalize_column_text(column)
        for canonical, aliases in self.COLUMN_ALIASES.items():
            if normalized in aliases:
                return canonical
        return normalized

    def _coerce_header(self, df: pd.DataFrame) -> pd.DataFrame:
        canonical = {self._canonical_column(column) for column in df.columns}
        if self.REQUIRED.issubset(canonical):
            return df

        preview = df.head(20).reset_index(drop=True)
        best_index = None
        best_score = 0
        for idx, row in preview.iterrows():
            values = [self._canonical_column(value) for value in row.tolist()]
            score = sum(1 for value in values if value in self.COLUMN_ALIASES)
            if score > best_score:
                best_score = score
                best_index = idx

        if best_index is None or best_score < 2:
            return df

        fixed = df.iloc[best_index + 1 :].copy()
        fixed.columns = preview.loc[best_index].tolist()
        fixed = fixed.dropna(how="all")
        return fixed

    def _normalize_column_text(self, value: Any) -> str:
        text = str(value).replace("\ufeff", "").replace("\xa0", " ")
        text = text.strip().lower().replace("_", " ").replace("-", " ")
        return " ".join(text.split())

    def _clean_value(self, value: Any) -> Any:
        if pd.isna(value):
            return None
        return value

    def _number(self, value: Any) -> float:
        if value is None or pd.isna(value):
            return 0.0
        if isinstance(value, (int, float)):
            return float(value)
        cleaned = (
            str(value)
            .replace(",", "")
            .replace("₹", "")
            .replace("?", "")
            .replace("Rs.", "")
            .replace("rs.", "")
            .strip()
        )
        if cleaned in {"", "-", "--"}:
            return 0.0
        return float(cleaned)

    def _infer_sector(self, stock_name: str) -> str:
        name = stock_name.lower()
        if any(token in name for token in ["bank", "hdfc", "icici", "axis", "sbi", "kotak"]):
            return "Banking"
        if any(token in name for token in ["tcs", "infosys", "wipro", "tech", "hcl"]):
            return "Information Technology"
        if any(token in name for token in ["reliance", "ongc", "oil", "gas", "power"]):
            return "Energy"
        if any(token in name for token in ["pharma", "labs", "dr reddy", "sun"]):
            return "Healthcare"
        if any(token in name for token in ["auto", "motors", "maruti", "mahindra", "tata"]):
            return "Automobile"
        return "Others"


portfolio_parser = PortfolioParser()
