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
from config import (
    IBM_API_KEY, IBM_IAM_URL,
    ORCHESTRATE_BASE_URL, ORCHESTRATE_MANAGER_AGENT_ID,
    ORCHESTRATE_API_KEY, MCSP_TOKEN_URL,
)

logger = logging.getLogger(__name__)

# Separate caches for IAM (used by Granite) and MCSP (used by Orchestrate)
_iam_cache:  dict = {"token": None, "expires_at": 0}
_mcsp_cache: dict = {"token": None, "expires_at": 0}


async def _get_iam_token() -> str:
    """IBM Cloud IAM token — used for watsonx.ai / Granite calls."""
    if _iam_cache["token"] and time.time() < _iam_cache["expires_at"] - 60:
        return _iam_cache["token"]

    async with httpx.AsyncClient(timeout=30.0) as client:
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

    _iam_cache["token"] = data["access_token"]
    _iam_cache["expires_at"] = time.time() + data.get("expires_in", 3600)
    return _iam_cache["token"]


async def _get_orchestrate_token() -> str:
    """
    Return the Bearer token for calling Orchestrate.

    If ORCHESTRATE_API_KEY is set, use it directly as the Bearer token —
    the Orchestrate UI generates pre-signed tokens, not raw API keys.
    Otherwise fall back to the standard IBM Cloud IAM token.
    """
    if ORCHESTRATE_API_KEY:
        logger.debug("Using ORCHESTRATE_API_KEY directly as Bearer token")
        return ORCHESTRATE_API_KEY

    return await _get_iam_token()


async def send_message_to_agent(user_message: str, thread_id: str | None = None) -> tuple[str, str | None]:
    """
    Send a single user message to the Manager Agent in watsonx Orchestrate.
    Returns (reply_text, thread_id) for conversation continuity.

    Tries Pattern 1 first (IBM SaaS /orchestrate/runs).
    Falls back to Pattern 2 (Developer Edition /chat/completions) if Pattern 1 returns 404.
    """
    token = await _get_orchestrate_token()
    base = ORCHESTRATE_BASE_URL.rstrip("/")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    # Build all candidate (url, body) pairs to try in order
    runs_body: dict = {
        "message": {"role": "user", "content": user_message},
        "agent_id": ORCHESTRATE_MANAGER_AGENT_ID,
        "environment_id": "draft",
    }
    if thread_id:
        runs_body["thread_id"] = thread_id

    chat_body = {
        "stream": False,
        "messages": [{"role": "user", "content": user_message}],
    }

    candidates = [
        ("v1/runs",       f"{base}/v1/orchestrate/runs",                                       runs_body),
        ("v1/chat",       f"{base}/v1/agents/{ORCHESTRATE_MANAGER_AGENT_ID}/chat/completions", chat_body),
        ("api/v1/runs",   f"{base}/api/v1/orchestrate/runs",                                   runs_body),
        ("api/v1/chat",   f"{base}/api/v1/orchestrate/{ORCHESTRATE_MANAGER_AGENT_ID}/chat/completions", chat_body),
        ("bare/runs",     f"{base}/orchestrate/runs",                                          runs_body),
        ("bare/chat",     f"{base}/{ORCHESTRATE_MANAGER_AGENT_ID}/chat/completions",           chat_body),
    ]

    last_response = None
    async with httpx.AsyncClient(timeout=120.0) as client:
        for label, url, body in candidates:
            r = await client.post(url, headers=headers, json=body)
            if r.is_success:
                data = r.json()
                logger.info("Orchestrate succeeded with pattern '%s': %s", label, url)
                new_thread_id = data.get("thread_id", thread_id)
                return _extract_reply(data), new_thread_id
            logger.warning("  [%s] %s → %d: %s", label, url, r.status_code, r.text[:120])
            last_response = r

    last_response.raise_for_status()
    return "", thread_id


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
