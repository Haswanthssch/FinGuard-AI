from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.logging import get_logger
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.portfolio import PortfolioAnalysisRequest, PortfolioCreate, PortfolioDetailResponse, PortfolioResponse, PortfolioUpdate
from app.services.analytics_service import analytics_service
from app.services.blob_storage_service import blob_storage_service
from app.services.portfolio_parser import portfolio_parser
from app.services.portfolio_service import portfolio_service
from app.services.ml_service import ml_service

router = APIRouter(prefix="/portfolio", tags=["portfolio"])
logger = get_logger(__name__)


def _holding_response(holding):
    current_value = holding.closing_value
    cost = holding.buy_value
    pnl = holding.unrealized_pnl
    return {
        "holding_id": holding.id,
        "portfolio_id": holding.portfolio_id,
        "symbol": holding.stock_name,
        "stock_name": holding.stock_name,
        "isin": holding.isin,
        "exchange": holding.exchange,
        "company_name": holding.stock_name,
        "sector": holding.sector,
        "asset_type": holding.asset_type,
        "quantity": holding.quantity,
        "purchase_price": holding.average_buy_price,
        "average_buy_price": holding.average_buy_price,
        "buy_value": holding.buy_value,
        "purchase_date": None,
        "current_price": holding.closing_price,
        "closing_price": holding.closing_price,
        "closing_value": holding.closing_value,
        "unrealized_pnl": holding.unrealized_pnl,
        "current_value": round(current_value, 2),
        "pnl": round(pnl, 2),
        "pnl_pct": round((pnl / cost * 100) if cost else 0, 2),
        "last_updated": holding.last_updated,
    }


def _portfolio_response(portfolio):
    return portfolio_service.summarize(portfolio)


@router.get("", response_model=list[PortfolioResponse])
async def list_portfolios(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return [_portfolio_response(p) for p in portfolio_service.list_user_portfolios(db, current_user)]


@router.post("", response_model=PortfolioResponse, status_code=status.HTTP_201_CREATED)
async def create_portfolio(payload: PortfolioCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    portfolio = portfolio_service.create_portfolio(db, current_user, payload)
    return _portfolio_response(portfolio)


@router.get("/{portfolio_id}", response_model=PortfolioDetailResponse)
async def get_portfolio(portfolio_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    portfolio = portfolio_service.get_portfolio(db, current_user, portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    analytics = portfolio_service.analytics_payload(portfolio)
    return {
        **_portfolio_response(portfolio),
        "holdings": [_holding_response(h) for h in portfolio.holdings],
        "sector_allocation": analytics["sector_allocation"],
        "top_holdings": analytics["top_holdings"],
        "top_gainers": analytics["top_gainers"],
        "top_losers": analytics["top_losers"],
        "concentration": analytics["concentration"],
    }


@router.put("/{portfolio_id}", response_model=PortfolioResponse)
async def update_portfolio(portfolio_id: str, payload: PortfolioUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    portfolio = portfolio_service.update_portfolio(db, current_user, portfolio_id, payload)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return _portfolio_response(portfolio)


@router.delete("/{portfolio_id}", status_code=204)
async def delete_portfolio(portfolio_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not portfolio_service.delete_portfolio(db, current_user, portfolio_id):
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return None


@router.get("/{portfolio_id}/metrics")
async def metrics(portfolio_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    portfolio = portfolio_service.get_portfolio(db, current_user, portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    holdings = portfolio_service.holdings_as_dicts(portfolio)
    computed = analytics_service.compute(holdings)
    return computed.__dict__


@router.post("/analyze")
async def analyze_portfolio(payload: PortfolioAnalysisRequest):
    holdings = [h.model_dump() for h in payload.holdings]
    return {"query": payload.query, "analytics": analytics_service.compute(holdings).__dict__}


@router.get("/{portfolio_id}/risk-assessment")
async def risk_assessment(portfolio_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    portfolio = portfolio_service.get_portfolio(db, current_user, portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    analytics = portfolio_service.analytics_payload(portfolio)
    holdings = portfolio_service.holdings_as_dicts(portfolio)
    
    # Run ML Analysis
    ml_results = ml_service.analyze_portfolio(holdings)
    logger.info(f"ML Analysis results for portfolio {portfolio_id}: {ml_results}")
    
    risk_score = analytics["risk_score"]
    # Map ML risk category if available, else use heuristic
    risk_level = ml_results.get("risk", {}).get("risk_category", "MEDIUM").upper()
    
    factors = [
        {"feature": "Top holding concentration", "direction": "higher", "impact": f"{analytics['top_holding_pct']}%"},
        {"feature": "Diversification score", "direction": "lower risk when higher", "impact": f"{analytics['diversification_score']}/100"},
        {"feature": "Estimated volatility", "direction": "higher", "impact": f"{analytics['estimated_volatility']}%"},
    ]
    
    # Add ML factors
    if "archetype" in ml_results:
        factors.append({
            "feature": "Portfolio Archetype",
            "direction": "classification",
            "impact": ml_results["archetype"].get("archetype", "Unknown")
        })

    recommendations = ["Reduce concentrated exposure where practical.", "Add sector balance if one sector dominates."]
    if risk_level == "SPECULATIVE":
        recommendations.append("Consider rebalancing towards safer assets to reduce speculative exposure.")

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "confidence": ml_results.get("risk", {}).get("confidence", 0.78),
        "top_factors": factors,
        "anomalies": [],
        "recommendations": recommendations,
        # Extended ML data
        "ml_insights": {
            "risk_category": ml_results.get("risk", {}).get("risk_category"),
            "archetype": ml_results.get("archetype", {}).get("archetype"),
            "stress_tests": ml_results.get("stress_vulnerability", {})
        }
    }


@router.post("/upload")
async def upload_portfolio(
    file: UploadFile = File(...),
    portfolio_name: str = Form("Primary Portfolio"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    content = await file.read()
    holdings = portfolio_parser.parse_content(file.filename or "portfolio", content)
    upload_file = {
        "filename": file.filename or "portfolio",
        "content_type": file.content_type,
        "size_bytes": len(content),
        "storage_backend": "database",
        "content": content,
    }
    portfolio = portfolio_service.create_from_holdings(
        db=db,
        user=current_user,
        portfolio_name=portfolio_name,
        holdings=holdings,
        description=f"Uploaded from {file.filename}",
        upload_file=None,
    )
    if blob_storage_service.configured():
        try:
            uploaded_blob = await blob_storage_service.upload_portfolio_file(
                content=content,
                filename=file.filename or "portfolio",
                user_id=current_user.user_id,
                portfolio_id=portfolio.id,
                content_type=file.content_type,
            )
            upload_file.update(
                {
                    "storage_backend": "azure_blob",
                    "content": None,
                    "blob_name": uploaded_blob.name,
                    "blob_url": uploaded_blob.public_url,
                    "size_bytes": uploaded_blob.size,
                }
            )
        except RuntimeError as exc:
            logger.warning("blob_upload_failed_using_database_storage error=%s", exc)
    portfolio = portfolio_service.attach_upload_file(db, portfolio, upload_file)
    summary = _portfolio_response(portfolio)
    return {
        "message": "Portfolio uploaded successfully",
        **summary,
        "holdings_count": len(portfolio.holdings),
    }


@router.post("/upload-csv")
async def upload_csv_compat(
    file: UploadFile = File(...),
    portfolio_name: str = Form("Primary Portfolio"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await upload_portfolio(file=file, portfolio_name=portfolio_name, db=db, current_user=current_user)
