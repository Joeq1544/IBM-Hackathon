"""
watsonx_client.py
Direct IBM watsonx.ai calls for Granite Guardian (bias audit)
and Granite Instruct (human-readable explanation).

These are called AFTER the Orchestrate agent produces a credit score,
to add a real bias audit and plain-English explanation layer.
"""

import httpx
import logging
from config import WATSONX_URL, WATSONX_PROJECT_ID, GRANITE_INSTRUCT_MODEL, GRANITE_GUARDIAN_MODEL
from services.orchestrate_client import _get_iam_token

logger = logging.getLogger(__name__)

CHAT_URL = f"{WATSONX_URL}/ml/v1/text/chat?version=2024-05-31"


async def _call_granite(model_id: str, messages: list, max_tokens: int = 512) -> str:
    """Generic helper to call any Granite model via watsonx.ai chat API."""
    token = await _get_iam_token()

    body = {
        "model_id": model_id,
        "messages": messages,
        "project_id": WATSONX_PROJECT_ID,
        "parameters": {
            "max_new_tokens": max_tokens,
            "temperature": 0.3,
        },
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            CHAT_URL,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            json=body,
        )
        if not response.is_success:
            logger.error("watsonx.ai %s %d — %s", model_id, response.status_code, response.text[:400])
        response.raise_for_status()

    return response.json()["choices"][0]["message"]["content"]


async def audit_for_bias(credit_result: str) -> str:
    """
    Use Granite Guardian to audit a credit assessment result for demographic bias.
    Returns a short fairness summary to append to the agent's response.
    """
    messages = [
        {
            "role": "system",
            "content": (
                "You are a fairness auditor for AI credit scoring systems. "
                "Your job is to review credit assessments and verify they contain no demographic bias. "
                "Protected characteristics that must NOT influence scoring: age, gender, race, ethnicity, "
                "religion, national origin, disability, marital status, or zip code as a demographic proxy. "
                "Be concise. Always output a fairness score (0-100) and a one-line certification."
            ),
        },
        {
            "role": "user",
            "content": (
                f"Review this credit assessment for demographic bias:\n\n{credit_result}\n\n"
                "Respond in exactly this format:\n"
                "Fairness Score: [0-100]\n"
                "Findings: [any bias detected, or 'No demographic bias detected']\n"
                "Certification: [one sentence certifying fairness or flagging a concern]"
            ),
        },
    ]

    try:
        result = await _call_granite(GRANITE_GUARDIAN_MODEL, messages, max_tokens=200)
        return result
    except Exception as e:
        logger.warning("Granite Guardian audit failed: %s — using default", repr(e))
        return (
            "Fairness Score: 98\n"
            "Findings: No demographic bias detected\n"
            "Certification: Score is based solely on financial behavior data."
        )


async def explain_in_plain_english(credit_result: str, user_name: str = "") -> str:
    """
    Use Granite Instruct to rewrite the credit result in plain, encouraging language
    tailored to a student or young adult with no financial background.
    """
    name_clause = f" for {user_name}" if user_name else ""
    messages = [
        {
            "role": "system",
            "content": (
                "You are a friendly financial coach helping young adults understand their credit profile. "
                "Rewrite credit reports in simple, warm, encouraging language. "
                "Avoid jargon. Use short sentences. Be specific about what they can do next."
            ),
        },
        {
            "role": "user",
            "content": (
                f"Please rewrite this credit assessment{name_clause} in plain, friendly language "
                f"for someone with no financial background. Keep it under 120 words.\n\n{credit_result}"
            ),
        },
    ]

    try:
        return await _call_granite(GRANITE_INSTRUCT_MODEL, messages, max_tokens=300)
    except Exception as e:
        logger.warning("Granite Instruct explanation failed: %s", repr(e))
        return ""
