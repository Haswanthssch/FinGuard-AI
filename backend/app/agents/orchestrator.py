import json
import operator
from typing import Annotated
from typing import Any, TypedDict

from langgraph.graph import END, StateGraph

from app.agents.compliance_agent import ComplianceIntelligenceAgent
from app.agents.performance_agent import PerformanceAnalyticsAgent
from app.agents.portfolio_agent import PortfolioIntelligenceAgent
from app.agents.prompts import SYNTHESIS_PROMPT
from app.agents.risk_agent import RiskExposureAgent
from app.agents.tools import build_portfolio_context
from app.schemas.aihub import AIHubChatResponse, AgentContribution
from app.services.groq_service import groq_service
from app.utils.helpers import clamp


class OrchestratorState(TypedDict, total=False):
    query: str
    session_id: str
    holdings: list[dict[str, Any]]
    context: dict[str, Any]
    selected_agents: list[str]
    contributions: Annotated[list[AgentContribution], operator.add]
    response: str
    llm_source: str


class AIHubOrchestrator:
    def __init__(self) -> None:
        self.agents = {
            "portfolio": PortfolioIntelligenceAgent(),
            "risk": RiskExposureAgent(),
            "performance": PerformanceAnalyticsAgent(),
            "compliance": ComplianceIntelligenceAgent(),
        }
        self.graph = self._build_graph()

    async def run(self, query: str, holdings: list[dict[str, Any]], session_id: str, context: dict | None = None) -> AIHubChatResponse:
        state: OrchestratorState = {
            "query": query,
            "session_id": session_id,
            "holdings": holdings,
            "context": context or {},
            "selected_agents": [],
            "contributions": [],
            "llm_source": "deterministic",
        }
        final_state = await self.graph.ainvoke(state)
        return self._build_response(final_state)

    def _build_graph(self):
        graph = StateGraph(OrchestratorState)
        graph.add_node("prepare_context", self._prepare_context)
        graph.add_node("route", self._route)
        graph.add_node("portfolio", self._run_portfolio)
        graph.add_node("risk", self._run_risk)
        graph.add_node("performance", self._run_performance)
        graph.add_node("compliance", self._run_compliance)
        graph.add_node("synthesize", self._synthesize)

        graph.set_entry_point("prepare_context")
        graph.add_edge("prepare_context", "route")
        graph.add_conditional_edges(
            "route",
            self._agent_nodes,
            {
                "portfolio": "portfolio",
                "risk": "risk",
                "performance": "performance",
                "compliance": "compliance",
                "synthesize": "synthesize",
            },
        )
        for node in ("portfolio", "risk", "performance", "compliance"):
            graph.add_edge(node, "synthesize")
        graph.add_edge("synthesize", END)
        return graph.compile()

    async def _prepare_context(self, state: OrchestratorState) -> OrchestratorState:
        portfolio_context = build_portfolio_context(state.get("holdings", []))
        state["context"] = {**portfolio_context, **state.get("context", {})}
        return state

    async def _route(self, state: OrchestratorState) -> OrchestratorState:
        requested_agent = state.get("context", {}).get("active_agent")
        if requested_agent in self.agents:
            state["selected_agents"] = [requested_agent]
        else:
            state["selected_agents"] = self._keyword_route(state["query"])
        state["llm_source"] = "deterministic"
        return state

    def _keyword_route(self, query: str) -> list[str]:
        text = query.lower()
        if self._is_direct_question(text):
            return []
        selected = []
        if any(word in text for word in ["portfolio", "allocation", "diversification", "sector", "rebalance", "holding"]):
            selected.append("portfolio")
        if any(word in text for word in ["risk", "var", "volatility", "drawdown", "concentration", "stress", "liquidity"]):
            selected.append("risk")
        if any(word in text for word in ["performance", "return", "cagr", "xirr", "alpha", "beta", "benchmark", "growth", "p&l"]):
            selected.append("performance")
        if any(word in text for word in ["compliance", "sebi", "rbi", "kyc", "aml", "regulation", "legal", "suitability"]):
            selected.append("compliance")
        return selected

    def _agent_nodes(self, state: OrchestratorState) -> list[str]:
        return state.get("selected_agents") or ["synthesize"]

    async def _run_portfolio(self, state: OrchestratorState) -> OrchestratorState:
        return await self._run_agent("portfolio", state)

    async def _run_risk(self, state: OrchestratorState) -> OrchestratorState:
        return await self._run_agent("risk", state)

    async def _run_performance(self, state: OrchestratorState) -> OrchestratorState:
        return await self._run_agent("performance", state)

    async def _run_compliance(self, state: OrchestratorState) -> OrchestratorState:
        return await self._run_agent("compliance", state)

    async def _run_agent(self, agent_name: str, state: OrchestratorState) -> OrchestratorState:
        contribution = await self.agents[agent_name].run(state["query"], state["context"])
        return {"contributions": [contribution]}

    async def _synthesize(self, state: OrchestratorState) -> OrchestratorState:
        contributions = self._unique_contributions(state.get("contributions", []))
        state["contributions"] = contributions
        if not contributions and self._is_direct_question(state["query"].lower()):
            state["response"] = self._direct_response(state["query"], state.get("context", {}))
            return state

        fallback = self._deterministic_synthesis(state["query"], contributions, state.get("context", {}))
        synthesis_input = json.dumps(
            {
                "query": state["query"],
                "portfolio_metrics": state["context"].get("metrics", {}),
                "agent_contributions": [c.model_dump() for c in contributions],
            },
            default=str,
        )
        response, source = await groq_service.complete_or_fallback(
            SYNTHESIS_PROMPT,
            synthesis_input,
            fallback=fallback,
            temperature=0.25,
            max_tokens=1400,
        )
        state["response"] = response
        state["llm_source"] = "groq" if source == "groq" or state.get("llm_source") == "groq" else source
        return state

    def _is_direct_question(self, text: str) -> bool:
        direct_phrases = [
            "can you answer",
            "what can you do",
            "what else can",
            "help me",
            "how do i use",
            "who are you",
            "hello",
            "hi",
            "hey",
            "thanks",
            "thank you",
        ]
        finance_words = [
            "portfolio",
            "allocation",
            "diversification",
            "sector",
            "rebalance",
            "holding",
            "risk",
            "volatility",
            "concentration",
            "performance",
            "return",
            "cagr",
            "xirr",
            "compliance",
            "sebi",
            "rbi",
        ]
        return any(phrase in text for phrase in direct_phrases) and not any(word in text for word in finance_words)

    def _deterministic_synthesis(self, query: str, contributions: list[AgentContribution], context: dict[str, Any]) -> str:
        if not contributions:
            return self._direct_response(query, context)

        if len(contributions) == 1:
            raw = (contributions[0].raw_output or "").strip()
            if raw.startswith("Summary:"):
                return "\n".join(
                    [
                        raw,
                        "",
                        "Confidence Notes:",
                        "- Live Groq reasoning was unavailable or rate-limited, so this answer used the specialist deterministic knowledge base and portfolio analytics.",
                    ]
                )

        metrics = context.get("metrics", {})
        lines = [
            "Summary:",
            self._summary_sentence(query, metrics),
            "",
            "Key Insights:",
        ]
        for contribution in contributions:
            raw = contribution.raw_output.strip()
            if raw:
                lines.append(f"- {contribution.agent.title()}: {raw[:420]}")
        for contribution in contributions:
            for insight in contribution.insights[:3]:
                lines.append(f"- {contribution.agent.title()}: {insight}")
        lines.extend(["", "Recommendations:"])
        for contribution in contributions:
            for recommendation in contribution.recommendations[:3]:
                lines.append(f"- {recommendation}")
        risk_items = [item for c in contributions for item in c.risk_observations]
        if risk_items:
            lines.extend(["", "Risk Observations:"])
            lines.extend([f"- {item}" for item in risk_items[:5]])
        lines.extend(["", "Confidence Notes:", "- This response used deterministic analytics because live Groq reasoning was unavailable or not configured."])
        return "\n".join(lines)

    def _unique_contributions(self, contributions: list[AgentContribution]) -> list[AgentContribution]:
        seen = set()
        unique = []
        for contribution in contributions:
            if contribution.agent in seen:
                continue
            seen.add(contribution.agent)
            unique.append(contribution)
        return unique

    def _direct_response(self, query: str, context: dict[str, Any]) -> str:
        metrics = context.get("metrics", {})
        holdings_count = metrics.get("holdings_count", 0)
        if self._is_direct_question(query.lower()):
            portfolio_line = (
                f"I can also use your uploaded portfolio context. Right now I can see {holdings_count} holding(s)."
                if holdings_count
                else "Upload a portfolio and I can ground the answers in your actual holdings."
            )
            return "\n".join(
                [
                    "Summary:",
                    "Yes. AI Hub can answer portfolio, risk, performance, and compliance questions, and it can route one question across multiple agents when needed.",
                    "",
                    "What you can ask:",
                    "- Portfolio: allocation quality, diversification, sector exposure, top holdings, and rebalancing ideas.",
                    "- Risk: concentration, volatility assumptions, downside exposure, liquidity flags, and stress-test style observations.",
                    "- Performance: total return, P&L, CAGR estimates, gainers, losers, and benchmark-style interpretation.",
                    "- Compliance: SEBI/RBI context, suitability notes, disclosure checks, and regulatory summaries.",
                    "",
                    "Recommendation:",
                    f"- {portfolio_line}",
                ]
            )
        return "\n".join(
            [
                "Summary:",
                "I can help with that, but I need a more specific finance, portfolio, risk, performance, or compliance question to route it properly.",
                "",
                "Recommendation:",
                "- Ask something like: 'What are my biggest concentration risks?' or 'How should I rebalance this portfolio?'",
            ]
        )

    def _summary_sentence(self, query: str, metrics: dict[str, Any]) -> str:
        holdings_count = metrics.get("holdings_count", 0)
        total_value = metrics.get("total_value", 0)
        if holdings_count:
            return f"I reviewed your question against the current portfolio context: {holdings_count} holding(s), total value {total_value}."
        return "I reviewed the question using the available AI Hub analytics context."

    def _build_response(self, state: OrchestratorState) -> AIHubChatResponse:
        contributions = self._unique_contributions(state.get("contributions", []))
        insights = [item for c in contributions for item in c.insights]
        recommendations = [item for c in contributions for item in c.recommendations]
        risk_observations = [item for c in contributions for item in c.risk_observations]
        avg_confidence = sum(c.confidence for c in contributions) / len(contributions) if contributions else 0.7
        return AIHubChatResponse(
            session_id=state.get("session_id", "aihub"),
            response=state.get("response", ""),
            summary=f"Analyzed by {', '.join(state.get('selected_agents', [])) or 'AI Hub'} agents.",
            insights=insights[:10],
            recommendations=recommendations[:10],
            risk_observations=risk_observations[:10],
            confidence_notes=[
                f"Overall confidence: {round(clamp(avg_confidence) * 100)}%",
                "Outputs combine deterministic portfolio analytics with Groq-powered reasoning when configured.",
            ],
            agents_used=state.get("selected_agents", []),
            contributions=contributions,
            llm_source=state.get("llm_source", "deterministic"),
            skills_used=state.get("selected_agents", []),
        )


aihub_orchestrator = AIHubOrchestrator()
