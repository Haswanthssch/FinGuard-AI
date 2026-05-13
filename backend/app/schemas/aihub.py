from pydantic import BaseModel, Field

from app.schemas.portfolio import HoldingInput


class AIHubChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    session_id: str | None = None
    portfolio_id: str | None = None
    portfolio_data: dict | None = None
    context: dict | None = None


class AgentContribution(BaseModel):
    agent: str
    summary: str
    insights: list[str] = []
    recommendations: list[str] = []
    risk_observations: list[str] = []
    confidence: float = 0.75
    raw_output: str | None = None


class AIHubChatResponse(BaseModel):
    session_id: str
    response: str
    summary: str
    insights: list[str]
    recommendations: list[str]
    risk_observations: list[str]
    confidence_notes: list[str]
    agents_used: list[str]
    contributions: list[AgentContribution]
    llm_source: str = "groq"
    skills_used: list[str] = []
    citations: list[dict] = []


class AgentAnalyzeRequest(BaseModel):
    agent: str
    query: str
    portfolio_data: dict | None = None
    context: dict | None = None
    holdings: list[HoldingInput] = []


class AgentAnalyzeResponse(BaseModel):
    agent: str
    analysis: str
    thinking: str | None = None
    model_used: str
    usage: dict = {"input_tokens": 0, "output_tokens": 0}

