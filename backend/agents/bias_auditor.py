from services.watsonx_client import get_granite_guardian
from langchain_core.prompts import PromptTemplate


BIAS_PROMPT = PromptTemplate.from_template(
    """You are a fairness and bias auditor for AI financial systems.

A credit scoring model produced the following result:
{credit_result}

The applicant provided the following demographic context (for bias checking only, NOT used in scoring):
{demographic_context}

Evaluate whether the scoring result shows signs of demographic bias (race, gender, zip code proxy, etc.).
Respond in JSON with keys:
  - bias_detected (bool)
  - bias_flags (list of strings describing any detected bias)
  - fairness_score (0-100, where 100 is fully unbiased)
  - recommendation (str)
"""
)


class BiasAuditorAgent:
    """
    Uses IBM Granite Guardian 3.2 to detect demographic bias in credit decisions.
    Demographic data is used ONLY for auditing — never as a scoring input.
    """

    def __init__(self):
        self.llm = get_granite_guardian()

    async def run(self, credit_result: dict, user_data: dict) -> dict:
        # Extract only demographic fields for audit — never passed to scorer
        demographic_context = {
            "age_range": user_data.get("age_range"),
            "zip_code": user_data.get("zip_code"),
            "gender": user_data.get("gender"),
            "ethnicity": user_data.get("ethnicity"),
        }

        chain = BIAS_PROMPT | self.llm
        response = chain.invoke({
            "credit_result": str(credit_result),
            "demographic_context": str(demographic_context),
        })

        import json, re
        match = re.search(r"\{.*\}", response, re.DOTALL)
        if match:
            return json.loads(match.group())

        return {
            "bias_detected": False,
            "bias_flags": [],
            "fairness_score": 100,
            "recommendation": "Audit inconclusive — manual review recommended",
            "raw_response": response,
        }
