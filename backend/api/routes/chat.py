import uuid
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from services.orchestrate_client import chat_with_agent

router = APIRouter()

# In-memory session store: session_id -> list of messages
_sessions: dict = {}

SYSTEM_PROMPT = """You are CreditPath, a friendly AI financial advisor helping students
and thin-file individuals build their Financial Resume. You have access to specialist
agents for data collection, credit analysis, bias auditing, and explanation.

Your job is to have a natural conversation to collect the user's financial information,
then when you have enough, run the full credit analysis pipeline and present the results.

Start by greeting the user warmly and asking for their name. Then ask about:
- Rent payments (amount, how many months, how often on time)
- Utility bills (electric, gas, internet — how consistent)
- Monthly income and expenses
- Education (enrolled in school? GPA?)
- Employment (working? how long?)

Ask one topic at a time. Be encouraging and conversational — not clinical.
When you have collected all the information, tell the user you're running their
analysis, then return the full credit report in a clear, friendly format including:
- Their score (300-850) and what tier it means
- What they did well
- What to improve
- A confirmation that the result was checked for fairness"""


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
    greeting = (
        f"Hi{' ' + body.name if body.name else ''}! I'm CreditPath, your AI financial advisor. "
        "I'm here to help build your Financial Resume using alternate credit data — "
        "so even without a credit card or loan history, we can show lenders who you really are. "
        "Let's get started. Can you tell me your name?"
        if not body.name
        else f"Hi {body.name}! I'm CreditPath, your AI financial advisor. "
        "I'm here to help build your Financial Resume using alternate credit data — "
        "so even without a credit card or loan history, we can show lenders who you really are. "
        "To get started, do you currently pay rent each month?"
    )
    _sessions[session_id] = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "assistant", "content": greeting},
    ]
    return ChatResponse(session_id=session_id, reply=greeting)


@router.post("/message", response_model=ChatResponse)
async def send_message(body: ChatMessage):
    if body.session_id not in _sessions:
        raise HTTPException(status_code=404, detail="Session not found. Please start a new chat.")

    messages = _sessions[body.session_id]
    messages.append({"role": "user", "content": body.message})

    try:
        reply = await chat_with_agent(messages)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    messages.append({"role": "assistant", "content": reply})
    _sessions[body.session_id] = messages

    is_final = any(phrase in reply.lower() for phrase in [
        "your score", "credit score", "financial resume", "out of 850", "risk tier"
    ])

    return ChatResponse(session_id=body.session_id, reply=reply, is_final=is_final)
