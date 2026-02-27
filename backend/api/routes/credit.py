import uuid
from fastapi import APIRouter, HTTPException
from api.schemas import UserSubmission, OrchestrateResponse
from services.orchestrate_client import invoke_manager_agent

router = APIRouter()


@router.post("/analyze", response_model=OrchestrateResponse)
async def analyze_credit(submission: UserSubmission):
    """
    Sends the user's financial profile to the Manager Agent in watsonx Orchestrate.
    Orchestrate handles all sub-agent routing internally.
    """
    try:
        user_id = str(uuid.uuid4())
        data = submission.model_dump()
        data["user_id"] = user_id
        result = await invoke_manager_agent(data)
        return OrchestrateResponse(user_id=user_id, raw=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/report/{user_id}")
async def get_report(user_id: str):
    """Retrieve a previously generated credit report by user ID."""
    # TODO: persist reports to a store (e.g. Cloudant or in-memory dict)
    raise HTTPException(status_code=404, detail="Report not found")
