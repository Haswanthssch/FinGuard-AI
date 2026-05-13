from typing import Any

from app.agents.base import BaseFinancialAgent
from app.agents.prompts import AGENT_PROMPTS


class ComplianceIntelligenceAgent(BaseFinancialAgent):
    name = "compliance"
    system_prompt = AGENT_PROMPTS["compliance"]

    def _fallback(self, query: str, context: dict[str, Any]) -> str:
        text = self._normalize_query(query)
        metrics = context.get("metrics", {})
        rag_context = context.get("regulatory_rag", {})
        retrieved_context = rag_context.get("context", "")
        flags = []
        if metrics.get("top_holding_pct", 0) > 25:
            flags.append("high concentration")
        if metrics.get("holdings_count", 0) < 5:
            flags.append("limited diversification")
        flag_text = ", ".join(flags) if flags else "no obvious portfolio structure flags"
        if "kyc" in text:
            response = "\n".join(
                [
                    "Summary:",
                    "KYC, or Know Your Customer, is the regulated process of identifying and verifying a customer and understanding the relationship to reduce fraud, money laundering, and misuse.",
                    "",
                    "Key Insights:",
                    "- In India, RBI KYC expectations cover customer acceptance, customer identification, due diligence, risk categorisation, monitoring, and records.",
                    "- KYC is not only document collection; it also includes understanding customer risk and keeping information current.",
                    "- Regulated entities should apply enhanced checks for higher-risk customers or unusual activity.",
                    "",
                    "Recommendations:",
                    "- Verify operational answers against the latest RBI Master Direction and applicable internal policy.",
                ]
            )
        elif "aml" in text or "money laundering" in text:
            response = "\n".join(
                [
                    "Summary:",
                    "AML controls are policies, processes, monitoring, and reporting steps designed to prevent financial systems from being used for money laundering or terrorist financing.",
                    "",
                    "Key Insights:",
                    "- AML programs usually include KYC/CDD, risk classification, transaction monitoring, sanctions screening, suspicious transaction escalation, and recordkeeping.",
                    "- Higher-risk relationships require stronger due diligence and ongoing monitoring.",
                    "- Compliance teams should document rationale, evidence, approvals, and escalation decisions.",
                    "",
                    "Recommendations:",
                    "- Treat AML answers as control guidance and verify final obligations against current law, regulator directions, and internal policy.",
                ]
            )
        elif "sebi" in text or "advisor" in text or "adviser" in text or "suitability" in text:
            response = "\n".join(
                [
                    "Summary:",
                    "SEBI-related investment advisory compliance generally focuses on registration, suitability, disclosure, conflict management, records, and investor protection.",
                    "",
                    "Key Insights:",
                    "- Advice should be aligned with client risk profile, objectives, financial situation, and needs.",
                    "- Conflicts, fees, assumptions, product risks, and limitations should be disclosed clearly.",
                    "- Suitability documentation matters when recommendations are personalized.",
                    f"- Portfolio structure check detected {flag_text}.",
                    "",
                    "Recommendations:",
                    "- Maintain risk profiling, advice rationale, disclosures, consent, and review notes.",
                    "- Verify final interpretations against official SEBI regulations and circulars.",
                ]
            )
        elif "rbi" in text or "digital lending" in text:
            response = "\n".join(
                [
                    "Summary:",
                    "RBI compliance questions usually depend on the regulated entity type, product, customer relationship, outsourcing model, and current RBI directions.",
                    "",
                    "Key Insights:",
                    "- Common RBI themes include KYC, customer protection, outsourcing controls, digital lending conduct, disclosure, grievance redressal, and transaction monitoring.",
                    "- Regulated entities remain accountable for outsourced activities.",
                    "- Specific obligations should be checked against the latest RBI Master Directions, circulars, and FAQs.",
                    "",
                    "Recommendations:",
                    "- Identify the entity type and product first, then map the applicable RBI obligation.",
                ]
            )
        else:
            response = "\n".join(
                [
                    "Summary:",
                    "Compliance analysis identifies the rules, controls, disclosures, documentation, and governance steps needed for a financial activity.",
                    "",
                    "Key Insights:",
                    f"- This is contextual guidance, not legal advice. Portfolio structure check detected {flag_text}.",
                    "- For investment portfolios, compliance often connects to suitability, risk disclosure, mandate alignment, and recordkeeping.",
                    "- For regulated financial services, obligations depend on the regulator, license type, customer segment, and product.",
                    "",
                    "Recommendations:",
                    "- State the regulator, entity type, product, and customer scenario for a more precise compliance answer.",
                    "- Verify final decisions against official circulars and internal compliance policy.",
                ]
            )
        if retrieved_context:
            response += f"\n\nRetrieved regulatory context:\n{retrieved_context[:1800]}"
        return response

    def _insights(self, context: dict[str, Any]) -> list[str]:
        metrics = context.get("metrics", {})
        rag_context = context.get("regulatory_rag", {})
        insights = [
            f"Holdings checked: {metrics.get('holdings_count', 0)}",
            "Regulatory interpretation is contextual and should be verified with official sources.",
        ]
        if rag_context.get("citations"):
            insights.append(f"Retrieved {len(rag_context['citations'])} regulatory source chunk(s).")
        return insights

    def _risk_observations(self, context: dict[str, Any]) -> list[str]:
        metrics = context.get("metrics", {})
        observations = []
        if metrics.get("top_holding_pct", 0) > 25:
            observations.append("High concentration may require enhanced suitability and disclosure review.")
        if metrics.get("holdings_count", 0) < 5:
            observations.append("Limited holdings may be unsuitable for some investor mandates.")
        return observations

    def _recommendations(self, context: dict[str, Any]) -> list[str]:
        return ["Maintain suitability notes, risk disclosures, and client mandate documentation."]
