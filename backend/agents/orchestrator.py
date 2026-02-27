from agents.data_collector import DataCollectorAgent
from agents.credit_analyzer import CreditAnalyzerAgent
from agents.bias_auditor import BiasAuditorAgent
from agents.explainability import ExplainabilityAgent


class Orchestrator:
    """
    Master coordinator. Runs the full agentic pipeline for a given user submission.
    Order: DataCollector -> CreditAnalyzer -> BiasAuditor -> Explainability
    """

    def __init__(self):
        self.data_collector = DataCollectorAgent()
        self.credit_analyzer = CreditAnalyzerAgent()
        self.bias_auditor = BiasAuditorAgent()
        self.explainability = ExplainabilityAgent()

    async def run(self, user_data: dict) -> dict:
        # Step 1: Collect and normalize alternate data
        alternate_data = await self.data_collector.run(user_data)

        # Step 2: Analyze creditworthiness with Granite 3.2 Instruct
        credit_result = await self.credit_analyzer.run(alternate_data)

        # Step 3: Audit for demographic bias with Granite Guardian 3.2
        bias_report = await self.bias_auditor.run(credit_result, user_data)

        # Step 4: Generate human-readable explanation
        explanation = await self.explainability.run(credit_result, bias_report)

        return {
            "score": credit_result["score"],
            "risk_tier": credit_result["risk_tier"],
            "explanation": explanation,
            "bias_report": bias_report,
            "alternate_data_summary": alternate_data,
        }
