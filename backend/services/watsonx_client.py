from langchain_ibm import WatsonxLLM
from config import IBM_API_KEY, WATSONX_PROJECT_ID, WATSONX_URL
from config import GRANITE_INSTRUCT_MODEL, GRANITE_GUARDIAN_MODEL


def get_granite_instruct() -> WatsonxLLM:
    """Returns a LangChain-compatible IBM Granite 3.2 Instruct LLM instance."""
    return WatsonxLLM(
        model_id=GRANITE_INSTRUCT_MODEL,
        url=WATSONX_URL,
        project_id=WATSONX_PROJECT_ID,
        apikey=IBM_API_KEY,
        params={
            "max_new_tokens": 1024,
            "temperature": 0.1,
            "top_p": 0.9,
        },
    )


def get_granite_guardian() -> WatsonxLLM:
    """Returns a LangChain-compatible IBM Granite Guardian 3.2 LLM instance."""
    return WatsonxLLM(
        model_id=GRANITE_GUARDIAN_MODEL,
        url=WATSONX_URL,
        project_id=WATSONX_PROJECT_ID,
        apikey=IBM_API_KEY,
        params={
            "max_new_tokens": 512,
            "temperature": 0.0,  # Deterministic for bias auditing
        },
    )
