from fastapi import APIRouter, HTTPException
from api.schemas import UserSubmission, CreditReportResponse
from agents.orchestrator import Orchestrator

router = APIRouter()


@router.post("/analyze", response_model=CreditReportResponse)
async def analyze_credit(submission: UserSubmission):
    """
    Main endpoint. Triggers the full agentic pipeline:
    DataCollector -> CreditAnalyzer -> BiasAuditor -> Explainability
    """
    try:
        orchestrator = Orchestrator()
        result = await orchestrator.run(submission.model_dump())
        return CreditReportResponse(user_id=submission.user_id, **result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/report/{user_id}")
async def get_report(user_id: str):
    """Retrieve a previously generated credit report by user ID."""
    # TODO: persist reports to a store (e.g. Cloudant or in-memory dict)
    raise HTTPException(status_code=404, detail="Report not found")
