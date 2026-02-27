"""
orchestrate_client.py
Handles all communication with IBM watsonx Orchestrate.
The FastAPI backend calls ONLY the Manager Agent — Orchestrate handles
routing to sub-agents (DataCollector, CreditAnalyzer, BiasAuditor, Explainability).
"""

import httpx
from config import IBM_API_KEY, IBM_IAM_URL, ORCHESTRATE_BASE_URL, ORCHESTRATE_MANAGER_AGENT_ID

# Simple in-process token cache (token valid ~60 min)
_token_cache: dict = {"token": None, "expires_at": 0}


async def _get_iam_token() -> str:
    """Exchange IBM API key for a Bearer token via IAM."""
    import time
    if _token_cache["token"] and time.time() < _token_cache["expires_at"] - 60:
        return _token_cache["token"]

    async with httpx.AsyncClient() as client:
        response = await client.post(
            IBM_IAM_URL,
            data={
                "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
                "apikey": IBM_API_KEY,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        response.raise_for_status()
        data = response.json()

    import time
    _token_cache["token"] = data["access_token"]
    _token_cache["expires_at"] = time.time() + data.get("expires_in", 3600)
    return _token_cache["token"]


async def invoke_manager_agent(user_data: dict) -> dict:
    """
    Send the user's financial profile to the Manager Agent in watsonx Orchestrate.
    The Manager Agent orchestrates all sub-agents and returns the complete result.
    """
    token = await _get_iam_token()

    # Build a structured message for the Manager Agent
    message = _build_agent_message(user_data)

    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            f"{ORCHESTRATE_BASE_URL}/agents/{ORCHESTRATE_MANAGER_AGENT_ID}/chat/completions",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
            },
            json={
                "messages": [{"role": "user", "content": message}],
                "context": {
                    "user_id": user_data.get("user_id"),
                    "profile": user_data,
                },
            },
        )
        response.raise_for_status()

    return response.json()


def _build_agent_message(user_data: dict) -> str:
    """Format user submission into a clear task message for the Manager Agent."""
    return f"""
Analyze the credit profile for the following individual and return a complete Financial Resume.

User ID: {user_data.get("user_id")}
Name: {user_data.get("name")}

Financial Profile:
- Monthly Rent: ${user_data.get("monthly_rent", "N/A")}
- Rent Payments On Time: {user_data.get("rent_months_on_time", "N/A")} months
- Utility Accounts: {user_data.get("utility_accounts", "N/A")}
- Utility Payments On Time: {user_data.get("utility_months_on_time", "N/A")} months
- Average Monthly Income: ${user_data.get("avg_monthly_income", "N/A")}
- Average Monthly Expenses: ${user_data.get("avg_monthly_expenses", "N/A")}
- Education Level: {user_data.get("education_level", "N/A")}
- GPA: {user_data.get("gpa", "N/A")}
- Employed: {user_data.get("employed", "N/A")}
- Months Employed: {user_data.get("months_employed", "N/A")}

Please run the full pipeline: collect and verify data, score creditworthiness,
audit for bias, and return a plain-English explanation.
""".strip()
