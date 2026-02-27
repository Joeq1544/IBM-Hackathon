"""
orchestrate_client.py
Handles all communication with IBM watsonx Orchestrate.
"""

import time
import httpx
from config import IBM_API_KEY, IBM_IAM_URL, ORCHESTRATE_BASE_URL, ORCHESTRATE_MANAGER_AGENT_ID

_token_cache: dict = {"token": None, "expires_at": 0}


async def _get_iam_token() -> str:
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

    _token_cache["token"] = data["access_token"]
    _token_cache["expires_at"] = time.time() + data.get("expires_in", 3600)
    return _token_cache["token"]


async def chat_with_agent(messages: list) -> str:
    """
    Send the full conversation history to the Manager Agent in watsonx Orchestrate.
    Returns the agent's next reply as a string.
    """
    token = await _get_iam_token()

    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            f"{ORCHESTRATE_BASE_URL}/agents/{ORCHESTRATE_MANAGER_AGENT_ID}/chat/completions",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
            },
            json={"messages": messages},
        )
        response.raise_for_status()
        data = response.json()

    return data["choices"][0]["message"]["content"]


async def invoke_manager_agent(user_data: dict) -> dict:
    """Single-shot invocation (kept for non-chat use cases)."""
    messages = [{"role": "user", "content": str(user_data)}]
    reply = await chat_with_agent(messages)
    return {"reply": reply}
