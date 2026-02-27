from fastapi import APIRouter, HTTPException
from api.schemas import BiasReportResponse

router = APIRouter()

# In-memory audit log for hackathon demo
_audit_log: dict = {}


@router.get("/{user_id}", response_model=BiasReportResponse)
async def get_bias_report(user_id: str):
    """Return the bias audit report for a given user's credit analysis."""
    if user_id not in _audit_log:
        raise HTTPException(status_code=404, detail="Audit report not found")
    return _audit_log[user_id]
