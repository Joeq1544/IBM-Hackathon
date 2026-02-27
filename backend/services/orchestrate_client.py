"""
orchestrate_client.py
Handles all communication with IBM watsonx Orchestrate Manager Agent.

The Manager Agent orchestrates the full credit analysis pipeline:
  DataCollector → CreditAnalyzer → BiasAuditor → Explainability

Two URL patterns are tried (IBM Cloud SaaS vs. Developer Edition layout):
  1. {BASE_URL}/orchestrate/runs          (body: agent_id, message, thread_id)
  2. {BASE_URL}/{AGENT_ID}/chat/completions  (body: messages array)
Update ORCHESTRATE_BASE_URL in .env to match your actual Orchestrate instance URL.
"""

import time
import httpx
import logging
from config import IBM_API_KEY, IBM_IAM_URL, ORCHESTRATE_BASE_URL, ORCHESTRATE_MANAGER_AGENT_ID

logger = logging.getLogger(__name__)

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


async def send_message_to_agent(user_message: str, thread_id: str | None = None) -> tuple[str, str | None]:
    """
    Send a single user message to the Manager Agent in watsonx Orchestrate.
    Returns (reply_text, thread_id) for conversation continuity.

    Tries Pattern 1 first (IBM SaaS /orchestrate/runs).
    Falls back to Pattern 2 (Developer Edition /chat/completions) if Pattern 1 returns 404.
    """
    token = await _get_iam_token()
    base = ORCHESTRATE_BASE_URL.rstrip("/")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    # ── Pattern 1: IBM Cloud SaaS ─────────────────────────────────────────────
    # POST {BASE_URL}/orchestrate/runs
    # Agent ID in body, thread_id for multi-turn continuity
    url_1 = f"{base}/orchestrate/runs"
    body_1: dict = {
        "message": {"role": "user", "content": user_message},
        "agent_id": ORCHESTRATE_MANAGER_AGENT_ID,
        "environment_id": "draft",
    }
    if thread_id:
        body_1["thread_id"] = thread_id

    async with httpx.AsyncClient(timeout=120.0) as client:
        r1 = await client.post(url_1, headers=headers, json=body_1)

    if r1.is_success:
        data = r1.json()
        logger.info("Orchestrate Pattern 1 succeeded")
        new_thread_id = data.get("thread_id", thread_id)
        return _extract_reply(data), new_thread_id

    logger.warning("Pattern 1 (%s) → %d: %s", url_1, r1.status_code, r1.text[:200])

    # ── Pattern 2: Developer Edition / local / alternative cloud layout ───────
    # POST {BASE_URL}/{AGENT_ID}/chat/completions
    # Full messages array in body (OpenAI-compatible)
    url_2 = f"{base}/{ORCHESTRATE_MANAGER_AGENT_ID}/chat/completions"
    body_2 = {
        "stream": False,
        "messages": [{"role": "user", "content": user_message}],
    }

    async with httpx.AsyncClient(timeout=120.0) as client:
        r2 = await client.post(url_2, headers=headers, json=body_2)

    if r2.is_success:
        data = r2.json()
        logger.info("Orchestrate Pattern 2 succeeded")
        return _extract_reply(data), thread_id

    logger.error("Pattern 2 (%s) → %d: %s", url_2, r2.status_code, r2.text[:200])

    # Both patterns failed — raise the most recent error
    r2.raise_for_status()
    return "", thread_id  # unreachable, but satisfies type checker


def _extract_reply(data: dict) -> str:
    """Extract text reply from an Orchestrate response, handling multiple formats."""
    # OpenAI-style choices
    if "choices" in data:
        return data["choices"][0]["message"]["content"]
    # Single message object
    if "message" in data:
        msg = data["message"]
        if isinstance(msg, dict):
            return msg.get("content", str(msg))
        return str(msg)
    # Watson Assistant output
    if "output" in data:
        output = data["output"]
        if isinstance(output, dict) and "generic" in output:
            texts = [i["text"] for i in output["generic"] if i.get("response_type") == "text"]
            if texts:
                return "\n".join(texts)
        return str(output)
    logger.warning("Unknown Orchestrate response format — keys: %s", list(data.keys()))
    return str(data)


# ── Backward-compatible wrappers used by other routes ────────────────────────

async def chat_with_agent(messages: list) -> str:
    last_user_msg = next(
        (m["content"] for m in reversed(messages) if m.get("role") == "user"), ""
    )
    reply, _ = await send_message_to_agent(last_user_msg)
    return reply


async def invoke_manager_agent(user_data: dict) -> dict:
    """Single-shot invocation used by the /credit/analyze endpoint."""
    reply, _ = await send_message_to_agent(str(user_data))
    return {"reply": reply}
