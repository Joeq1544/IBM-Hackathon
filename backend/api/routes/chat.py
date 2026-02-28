import uuid
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.watsonx_client import chat_with_granite, audit_for_bias

logger = logging.getLogger(__name__)

router = APIRouter()

# session_id -> {messages, thread_id, name}
_sessions: dict = {}

GREETING_TEMPLATE = (
    "Hi{name_part}! I'm CreditPath, your AI financial advisor. "
    "I'm here to help build your Financial Resume using alternate credit data — "
    "so even without a credit card or loan history, we can show lenders who you really are. "
    "{followup}"
)


class ChatStart(BaseModel):
    name: str = ""
    email: str = ""


class ChatMessage(BaseModel):
    session_id: str
    message: str


class ChatResponse(BaseModel):
    session_id: str
    reply: str
    is_final: bool = False


@router.post("/start", response_model=ChatResponse)
async def start_chat(body: ChatStart):
    session_id = str(uuid.uuid4())
    name = body.name.strip()
    name_part = f" {name}" if name else ""
    followup = (
        "To get started, do you currently pay rent each month?"
        if name
        else "Can you tell me your name?"
    )
    greeting = GREETING_TEMPLATE.format(name_part=name_part, followup=followup)

    _sessions[session_id] = {
        "messages": [{"role": "assistant", "content": greeting}],
        "thread_id": None,
        "name": name,
    }
    return ChatResponse(session_id=session_id, reply=greeting)


@router.post("/message", response_model=ChatResponse)
async def send_message(body: ChatMessage):
    if body.session_id not in _sessions:
        raise HTTPException(status_code=404, detail="Session not found. Please start a new chat.")

    session = _sessions[body.session_id]
    session["messages"].append({"role": "user", "content": body.message})

    # ── Step 1: IBM Granite 3.2 Instruct drives the conversation ─────────────
    try:
        reply = await chat_with_granite(session["messages"][:-1] + [{"role": "user", "content": body.message}])
    except Exception as e:
        logger.error("chat_with_granite failed: %s", repr(e))
        raise HTTPException(status_code=500, detail=str(e))

    session["messages"].append({"role": "assistant", "content": reply})

    # ── Step 2: Detect final score → run Granite Guardian bias audit ──────────
    is_final = any(phrase in reply.lower() for phrase in [
        "your score", "credit score", "financial resume", "out of 850", "risk tier",
        "/ 850", "low risk", "medium risk", "high risk",
    ])

    if is_final:
        try:
            bias_report = await audit_for_bias(reply)
            # Append the bias audit below the agent's score report
            reply = (
                f"{reply}\n\n"
                f"---\n"
                f"🔍 **Independent Bias Audit** *(IBM Granite Guardian)*\n"
                f"{bias_report}"
            )
            session["messages"][-1]["content"] = reply
        except Exception as e:
            logger.warning("Bias audit failed (non-fatal): %s", repr(e))

    return ChatResponse(session_id=body.session_id, reply=reply, is_final=is_final)
