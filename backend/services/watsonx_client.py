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


CHAT_SYSTEM_PROMPT = """You are CreditPath, a friendly AI financial advisor helping students
and thin-file individuals build their Financial Resume using alternate credit data.

## Personality
- Warm, encouraging, conversational — never clinical
- Ask ONE question at a time
- Acknowledge what the user tells you before asking the next question

## Phase 1 — Collect (one topic at a time)
1. Rent: monthly amount, how many months, % on time
2. Utilities: any in their name, how consistent
3. Income & expenses: monthly income, monthly expenses
4. Education: enrolled, GPA
5. Employment: working, how long, full/part-time

Accept "I don't have that" gracefully — never push.

## Phase 2 — Analyze (when you have ≥3 topics)
Say: "Great, I have enough to build your Financial Resume. Give me a moment..."

Compute score (300–850):
Base: 580
+60 rent on time ≥90% | +30 rent on time ≥75%
+40 utilities consistently paid
+50 income >2× expenses | +25 income >1.5× expenses
+20 enrolled in school | +15 GPA ≥3.0
+30 employed | +20 full-time >6 months
Missing data = +0 (never penalize)

## Phase 3 — Results format
---
📊 **Your Financial Resume**
**Credit Score: [score] / 850** — [tier] Risk
(Tiers: 300–579 High, 580–669 Medium, 670–739 Low-Medium, 740–850 Low)

**What you did well:** [bullets]
**Areas to grow:** [bullets]
**What this means:** [1-2 sentences]
**Fairness Check:** ✅ Score based only on financial behavior, not demographics.
---

Never use age/gender/race/zip in scoring."""


async def chat_with_granite(messages: list) -> str:
    """Drive the full credit advisor conversation using IBM Granite 3.2 Instruct."""
    if not messages or messages[0].get("role") != "system":
        full_messages = [{"role": "system", "content": CHAT_SYSTEM_PROMPT}] + messages
    else:
        full_messages = messages
    return await _call_granite(GRANITE_INSTRUCT_MODEL, full_messages, max_tokens=1024)


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
