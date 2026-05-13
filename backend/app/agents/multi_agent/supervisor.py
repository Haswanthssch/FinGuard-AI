from typing import List, Optional
from pydantic import BaseModel, Field
from langchain_core.prompts import ChatPromptTemplate
from app.services.groq_service import groq_service

class RouterOutput(BaseModel):
    """Decide which agents to call and in what order."""
    selected_agents: List[str] = Field(
        description="List of agents to invoke. Options: portfolio, risk, performance, compliance."
    )
    is_regulatory_needed: bool = Field(
        description="Whether a general regulatory lookup (SEBI/RBI) is required."
    )
    reasoning: str = Field(description="Explanation for the agent selection.")

class SupervisorAgent:
    def __init__(self):
        self.system_prompt = """You are the Lead Financial Strategist and AI Supervisor at FinGuard.
Your task is to orchestrate a team of specialized agents to answer complex financial queries.

Specialists at your disposal:
1. portfolio: Use for queries about holdings, asset allocation, diversification, and sector exposure.
2. risk: Use for queries about market stress, volatility, beta, drawdown, and risk mitigation.
3. performance: Use for queries about returns (CAGR, P&L), benchmark comparisons, and gainers/losers.
4. compliance: Use for queries about SEBI/RBI regulations, Indian financial law, and investor protection.

Decision Logic:
- If a query is complex (e.g., "Analyze my risk and returns"), select multiple agents.
- For general greetings, return an empty list of agents.
- For queries about Indian regulations or taxes, always include the 'compliance' agent and set is_regulatory_needed=true."""

    async def route(self, query: str) -> RouterOutput:
        # Use Groq for structured routing
        # We can use groq_service or direct langchain if preferred
        # Since groq_service is already integrated, let's use a structured prompt
        
        user_prompt = f"Return ONLY a JSON object matching the RouterOutput schema.\nUser Query: {query}\n\nDecision:"
        
        response, _ = await groq_service.complete_or_fallback(
            self.system_prompt, 
            user_prompt,
            fallback='{"selected_agents": [], "is_regulatory_needed": false, "reasoning": "fallback"}',
            temperature=0
        )
        
        try:
            # Clean up response in case of markdown blocks
            clean_json = response.strip()
            if "```json" in clean_json:
                clean_json = clean_json.split("```json")[1].split("```")[0].strip()
            elif "```" in clean_json:
                clean_json = clean_json.split("```")[1].split("```")[0].strip()
                
            data = RouterOutput.model_validate_json(clean_json)
            return data
        except Exception:
            # Fallback to empty if LLM fails
            return RouterOutput(selected_agents=[], is_regulatory_needed=False, reasoning="Fallback due to parsing error")

supervisor_agent = SupervisorAgent()
