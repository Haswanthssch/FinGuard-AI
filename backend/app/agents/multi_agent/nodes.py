import json
from typing import Any, Dict, List
from .state import GraphState, AgentOutput
from .tools import ALL_TOOLS, PORTFOLIO_TOOLS, RISK_TOOLS, PERFORMANCE_TOOLS, COMPLIANCE_TOOLS
from app.services.groq_service import groq_service

class FinancialAgentNode:
    def __init__(self, agent_name: str, system_prompt: str, tools: List[Any]):
        self.agent_name = agent_name
        self.system_prompt = system_prompt
        self.tools = tools

    async def __call__(self, state: GraphState) -> Dict[str, Any]:
        """Execute the agent logic."""
        query = state["query"]
        holdings = state["holdings"]
        
        # In a real agentic setup, we would use LangChain's AgentExecutor.
        # Here we'll simulate the agentic loop to keep it compatible with existing infrastructure.
        
        # 1. Provide tools context to the LLM
        tool_desc = "\n".join([f"- {t.name}: {t.description}" for t in self.tools])
        
        # 2. Run the agentic analysis
        # We pass the portfolio metrics if they were already computed, otherwise agent can use tools.
        context = {
            "metrics": state.get("portfolio_metrics", {}),
            "previous_analyses": [o.model_dump() for o in state.get("agent_outputs", [])]
        }
        
        user_prompt = f"Available Tools:\n{tool_desc}\n\nPortfolio Context:\n{json.dumps(context, default=str)}\n\nAnalyze the following query: {query}\n\nReturn your analysis in the required JSON format."
        
        response, source = await groq_service.complete_or_fallback(
            self.system_prompt,
            user_prompt,
            fallback='{"analysis": "Analysis temporarily unavailable due to a processing error."}',
            temperature=0.2
        )
        
        try:
            clean_json = response.strip()
            if "```json" in clean_json:
                clean_json = clean_json.split("```json")[1].split("```")[0].strip()
            
            data = json.loads(clean_json)
            agent_output = AgentOutput(
                agent_name=self.agent_name,
                thought=data.get("thought", ""),
                analysis=data.get("analysis", ""),
                insights=data.get("insights", []),
                recommendations=data.get("recommendations", []),
                risk_observations=data.get("risk_observations", []),
                confidence=data.get("confidence", 1.0)
            )
            
            return {
                "agent_outputs": [agent_output],
                "llm_source": source
            }
        except Exception as e:
            # Fallback output
            return {
                "agent_outputs": [AgentOutput(
                    agent_name=self.agent_name,
                    thought="Parsing failed",
                    analysis=f"Agent encountered an error: {str(e)}",
                    confidence=0.0
                )]
            }

# Instantiate Nodes with Deep-Intelligence Personas
portfolio_node = FinancialAgentNode(
    "portfolio", 
    """You are the Lead Portfolio Strategist at FinGuard AI. 
Analyze the user's holdings with a focus on asset allocation, sector-level diversification, and institutional-grade rebalancing strategies. 
Identify over-concentration in specific stocks or sectors and suggest professional diversification paths.
Use a formal, data-driven tone.""",
    PORTFOLIO_TOOLS
)

risk_node = FinancialAgentNode(
    "risk", 
    """You are the Chief Risk Officer. 
Analyze the portfolio for volatility, maximum drawdown potential, and tail risks. 
Assess concentration risk and market sensitivity (Beta). 
Suggest hedging strategies or risk-mitigation adjustments based on current market stress levels.
Be conservative and detail-oriented.""",
    RISK_TOOLS
)

performance_node = FinancialAgentNode(
    "performance", 
    """You are a Senior Performance Attribution Analyst. 
Evaluate portfolio returns, CAGR, and P&L metrics. 
Compare performance against relevant benchmarks and identify 'Alpha' generators vs 'Beta' laggards. 
Highlight the biggest gainers and losers and explain their impact on the total portfolio yield.""",
    PERFORMANCE_TOOLS
)

compliance_node = FinancialAgentNode(
    "compliance", 
    """You are a Financial Compliance & Regulatory Specialist. 
Review the user's query and portfolio against SEBI and RBI regulatory frameworks. 
Focus on investor protection, suitability rules, and mandatory disclosure requirements. 
If the query involves specific regulations (like KYC, AML, or tax), provide precise, evidence-based guidance.""",
    COMPLIANCE_TOOLS
)
