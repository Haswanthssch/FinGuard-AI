from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import agents, aihub, auth, chat, health, market, portfolio, regulatory
from app.core.config import settings
from app.core.database import Base, engine
from app.core.logging import configure_logging, get_logger
from app.middleware.request_logger import RequestLoggerMiddleware

configure_logging()
logger = get_logger(__name__)


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description="FinGuard AI Hub Multi-Agent Orchestration Backend",
    )

    Base.metadata.create_all(bind=engine)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(RequestLoggerMiddleware)

    app.include_router(health.router, prefix="/api/v1")
    app.include_router(auth.router, prefix="/api/v1")
    app.include_router(portfolio.router, prefix="/api/v1")
    app.include_router(market.router, prefix="/api/v1")
    app.include_router(aihub.router, prefix="/api/v1")
    app.include_router(chat.router, prefix="/api/v1")
    app.include_router(agents.router, prefix="/api/v1")
    app.include_router(regulatory.router, prefix="/api/v1")

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(_, exc: Exception):
        logger.exception("unhandled_exception", exc_info=exc)
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"},
        )

    return app


app = create_app()
