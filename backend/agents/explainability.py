from services.watsonx_client import get_granite_instruct
from langchain_core.prompts import PromptTemplate


EXPLAIN_PROMPT = PromptTemplate.from_template(
    """You are a financial advisor helping a student understand their credit assessment.

Credit Result: {credit_result}
Bias Audit: {bias_report}

Write a clear, friendly, plain-English explanation (3-5 sentences) of:
1. What their score means
2. What they did well
3. What they can improve
4. That the process was checked for fairness

Keep it encouraging and actionable. Avoid financial jargon.
"""
)


class ExplainabilityAgent:
    """
    Uses IBM Granite 3.2 Instruct to generate plain-English explanations of credit decisions.
    Core to the 'Explainable AI' requirement.
    """

    def __init__(self):
        self.llm = get_granite_instruct()

    async def run(self, credit_result: dict, bias_report: dict) -> str:
        chain = EXPLAIN_PROMPT | self.llm
        response = chain.invoke({
            "credit_result": str(credit_result),
            "bias_report": str(bias_report),
        })
        return response.strip()
