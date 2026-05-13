import json
from typing import Dict, List, Any
from langgraph.graph import StateGraph, END
from .state import GraphState, AgentOutput
from .supervisor import supervisor_agent
from .nodes import portfolio_node, risk_node, performance_node, compliance_node
from .tools import get_portfolio_analytics
from app.services.groq_service import groq_service
from app.schemas.aihub import AIHubChatResponse, AgentContribution

class MultiAgentOrchestrator:
    def __init__(self):
        self.graph = self._build_graph()

    def _build_graph(self):
        builder = StateGraph(GraphState)

        # Add Nodes
        builder.add_node("supervisor", self._supervisor_node)
        builder.add_node("portfolio", portfolio_node)
        builder.add_node("risk", risk_node)
        builder.add_node("performance", performance_node)
        builder.add_node("compliance", compliance_node)
        builder.add_node("synthesizer", self._synthesizer_node)

        # Set Entry Point
        builder.set_entry_point("supervisor")

        # Dynamic Routing from Supervisor
        builder.add_conditional_edges(
            "supervisor",
            self._route_decision,
            {
                "portfolio": "portfolio",
                "risk": "risk",
                "performance": "performance",
                "compliance": "compliance",
                "synthesizer": "synthesizer"
            }
        )

        # Edges back to synthesizer (or parallel branches)
        # For simplicity in this version, we route sequentially but based on the list
        builder.add_edge("portfolio", "synthesizer")
        builder.add_edge("risk", "synthesizer")
        builder.add_edge("performance", "synthesizer")
        builder.add_edge("compliance", "synthesizer")
        builder.add_edge("synthesizer", END)

        return builder.compile()

    async def _supervisor_node(self, state: GraphState) -> Dict[str, Any]:
        """Runs the supervisor to plan the analysis."""
        # 1. Ensure metrics are present
        metrics = state.get("portfolio_metrics", {})
        if not metrics:
            metrics = get_portfolio_analytics.invoke({"holdings": state["holdings"]})
        
        # 2. Get routing decision
        decision = await supervisor_agent.route(state["query"])
        
        return {
            "portfolio_metrics": metrics,
            "next_steps": decision.selected_agents,
            "metadata": {"routing_reason": decision.reasoning, "regulatory_needed": decision.is_regulatory_needed}
        }

    def _route_decision(self, state: GraphState) -> List[str]:
        """Determines which agent nodes to visit next. Supports parallel execution."""
        next_steps = state.get("next_steps", [])
        if not next_steps:
            return ["synthesizer"]
        
        return next_steps

    async def _synthesizer_node(self, state: GraphState) -> Dict[str, Any]:
        """Synthesizes the final institutional-quality response."""
        outputs = state.get("agent_outputs", [])
        query = state["query"]
        metrics = state.get("portfolio_metrics", {})
        
        if not outputs:
            # Directly answer the query using the main intelligence
            response, source = await groq_service.complete_or_fallback(
                "You are FinGuard AI, a world-class multi-agent financial assistant. Answer the user's query comprehensively.",
                f"User Query: {query}\n\nPlease provide a helpful, intelligent response.",
                fallback="I am FinGuard AI, your financial assistant. How can I help you today?"
            )
            return {"final_response": response, "llm_source": source, "confidence_score": 0.8}

        # Structured synthesis
        synthesis_input = {
            "query": query,
            "metrics": metrics,
            "agent_findings": [o.model_dump() for o in outputs]
        }
        
        system_prompt = "You are FinGuard AI's Head of Investment Strategy. Synthesize the findings from our specialized agents into a cohesive, executive-grade report for the client."
        
        response, source = await groq_service.complete_or_fallback(
            system_prompt, 
            json.dumps(synthesis_input, default=str),
            fallback="Strategic analysis completed, but synthesis failed. Please review individual agent findings.",
            temperature=0.3
        )
        
        return {
            "final_response": response,
            "llm_source": source,
            "confidence_score": sum(o.confidence for o in outputs) / len(outputs) if outputs else 0.8
        }

    async def run(self, query: str, holdings: List[Dict[str, Any]], session_id: str, context: Dict[str, Any] = None) -> AIHubChatResponse:
        """Main entry point for the orchestrator."""
        state: GraphState = {
            "query": query,
            "session_id": session_id,
            "holdings": holdings,
            "portfolio_metrics": {},
            "next_steps": [],
            "current_agent": "",
            "agent_outputs": [],
            "tool_calls": [],
            "final_response": "",
            "llm_source": "groq",
            "confidence_score": 0.0,
            "metadata": {}
        }
        
        # The actual graph execution logic needs to handle the sequential/parallel flow 
        # based on the next_steps. For this refactor, we'll keep it simple:
        # We run the graph. Since LangGraph handles state updates, we need to ensure
        # that 'next_steps' is popped correctly.
        
        # For a truly parallel execution, we would modify _route_decision to return the list of agents
        # and use parallel edges.
        
        final_state = await self.graph.ainvoke(state)
        
        # Convert GraphState to AIHubChatResponse
        outputs = final_state.get("agent_outputs", [])
        insights = [item for o in outputs for item in o.insights]
        recommendations = [item for o in outputs for item in o.recommendations]
        risk_obs = [item for o in outputs for item in o.risk_observations]
        
        contributions = [
            AgentContribution(
                agent=o.agent_name,
                raw_output=o.analysis,
                insights=o.insights,
                recommendations=o.recommendations,
                risk_observations=o.risk_observations,
                confidence=o.confidence
            ) for o in outputs
        ]
        
        return AIHubChatResponse(
            session_id=session_id,
            response=final_state["final_response"],
            summary=f"Analyzed by {', '.join([o.agent_name for o in outputs]) or 'Supervisor'} agents.",
            insights=insights[:10],
            recommendations=recommendations[:10],
            risk_observations=risk_obs[:10],
            confidence_notes=[f"Analysis confidence: {int(final_state['confidence_score']*100)}%"],
            agents_used=[o.agent_name for o in outputs],
            contributions=contributions,
            llm_source=final_state["llm_source"],
            skills_used=[o.agent_name for o in outputs]
        )

# Export instance
multi_agent_orchestrator = MultiAgentOrchestrator()
