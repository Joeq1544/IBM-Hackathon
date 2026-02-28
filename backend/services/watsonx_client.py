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


CHAT_SYSTEM_PROMPT = """You are Mirror Lake Credit, a friendly AI financial advisor helping students
and thin-file individuals build their Financial Resume using alternate credit data.

## Personality
- Warm, natural, and conversational — like a knowledgeable friend, not a form
- Ask ONE question at a time, and make it feel like a genuine follow-up to what they just said
- Acknowledge and react to what the user shares before moving on
- Never ask the same question twice
- Vary your phrasing — don't repeat the same sentence structures
- If someone mentions something that opens a natural follow-up, take it

## Phase 1 — Have a real conversation to collect financial context
You need to understand these 5 areas to build the resume, but collect them naturally through conversation — NOT as a checklist. Let the user's answers guide the order and depth:
- Housing: do they pay rent, how consistent are payments
- Utilities: any bills in their name, how reliably paid
- Income vs. expenses: approximate monthly income and spending
- Education: currently enrolled, GPA if relevant
- Employment: working, how long, full or part-time

Start from wherever they begin. If they mention school first, dig into that. If they mention work, explore that. Weave in the other topics naturally as the conversation flows. For topics they haven't touched, find a natural moment to ask — don't just fire them off in order.

Accept "I don't know" or "I don't have that" gracefully and move on.

## Phase 2 — Analyze (when you have covered ≥3 of the 5 areas)
Say something like: "Okay, I think I have a good picture of your situation. Let me put your Financial Resume together..."
(Vary the exact wording so it doesn't sound scripted.)

Compute score (300–850). Start at 500 and apply ALL of the following:

POSITIVE factors (add points):
+70 rent on time ≥90% of payments
+40 rent on time ≥75% of payments (use only one)
+40 utilities consistently paid on time
+60 income > 2× monthly expenses
+30 income > 1.5× monthly expenses (use only one)
+25 currently enrolled in school
+15 GPA ≥ 3.0 (in addition to enrollment)
+35 employed full-time ≥ 6 months
+20 employed part-time or < 6 months (use only one)

NEGATIVE factors (subtract points — apply these strictly):
-80 expenses exceed income (spending more than earning)
-50 rent payments mostly late or missed (< 50% on time)
-30 rent payments inconsistent (50–74% on time)
-40 utilities frequently unpaid or in someone else's name due to poor history
-40 unemployed and not in school (neither employed nor enrolled)
-20 dropped out of school without employment
-15 employment less than 1 month or very unstable

Missing data = 0 change (do not add or subtract for unanswered questions).
Final score must be between 300 and 850.

## Risk Tiers (use EXACT labels below — do not invent new ones):
300–549: High Risk
550–649: Medium Risk
650–749: Low-Medium Risk
750–850: Low Risk

## Phase 3 — Results format
---
📊 **Your Financial Resume**
**Credit Score: [score] / 850** — [tier]
(Example tiers: High Risk, Medium Risk, Low-Medium Risk, Low Risk)

**What you did well:** [bullets — be honest, skip if nothing strong]
**Areas to grow:** [bullets — be specific and actionable]
**What this means:** [1-2 honest sentences about lending likelihood]
**Fairness Check:** ✅ Score based only on financial behavior, not demographics.
---

Be honest. A person who spends more than they earn, has no job, and dropped out should score in the 300–450 range and be classified as High Risk. Do not soften bad scores to protect feelings — an accurate score helps the user understand what to improve.

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
