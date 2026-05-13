from typing import Annotated, Any, Dict, List, TypedDict, Union
import operator
from pydantic import BaseModel, Field

class AgentOutput(BaseModel):
    agent_name: str
    thought: str
    analysis: str
    insights: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    risk_observations: List[str] = Field(default_factory=list)
    confidence: float = 1.0

class GraphState(TypedDict):
    # User Input
    query: str
    session_id: str
    
    # Data Context
    holdings: List[Dict[str, Any]]
    portfolio_metrics: Dict[str, Any]
    
    # Orchestration
    next_steps: List[str]
    current_agent: str
    
    # Accumulated Intelligence
    agent_outputs: Annotated[List[AgentOutput], operator.add]
    tool_calls: Annotated[List[Dict[str, Any]], operator.add]
    
    # Final Output
    final_response: str
    llm_source: str
    confidence_score: float
    metadata: Dict[str, Any]
