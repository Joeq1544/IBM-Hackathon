"""
orchestrate_client.py
Previously called IBM watsonx Orchestrate; now delegates to Gemini via watsonx_client.
"""

from services.watsonx_client import chat_with_granite


async def chat_with_agent(messages: list) -> str:
    return await chat_with_granite(messages)


async def invoke_manager_agent(user_data: dict) -> dict:
    """Single-shot invocation used by the /credit/analyze endpoint."""
    messages = [{"role": "user", "content": str(user_data)}]
    reply = await chat_with_granite(messages)
    return {"reply": reply}
