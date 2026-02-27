from services.watsonx_client import get_granite_instruct
from langchain_core.prompts import PromptTemplate


CREDIT_PROMPT = PromptTemplate.from_template(
    """You are a credit risk analyst. Given the following alternate financial data for a student
or thin-file individual, produce a credit score (300-850), a risk tier (Low/Medium/High),
and a list of key positive and negative factors.

Alternate Data:
{alternate_data}

Respond in JSON with keys: score (int), risk_tier (str), positive_factors (list), negative_factors (list).
"""
)


class CreditAnalyzerAgent:
    """
    Uses IBM Granite 3.2 Instruct to reason over alternate data and produce a credit score.
    """

    def __init__(self):
        self.llm = get_granite_instruct()

    async def run(self, alternate_data: dict) -> dict:
        chain = CREDIT_PROMPT | self.llm
        response = chain.invoke({"alternate_data": str(alternate_data)})

        # Parse JSON from model output
        import json, re
        match = re.search(r"\{.*\}", response, re.DOTALL)
        if match:
            return json.loads(match.group())

        # Fallback structure if parsing fails
        return {
            "score": 0,
            "risk_tier": "Unknown",
            "positive_factors": [],
            "negative_factors": ["Model output could not be parsed"],
            "raw_response": response,
        }
