from pydantic import BaseModel
from typing import Optional, List


class UserSubmission(BaseModel):
    user_id: str
    name: str
    email: str
    # Alternate data inputs
    monthly_rent: Optional[float] = None
    rent_months_on_time: Optional[int] = None
    utility_accounts: Optional[int] = None
    utility_months_on_time: Optional[int] = None
    avg_monthly_income: Optional[float] = None
    avg_monthly_expenses: Optional[float] = None
    education_level: Optional[str] = None
    gpa: Optional[float] = None
    employed: Optional[bool] = None
    months_employed: Optional[int] = None
    # Demographic fields — for bias auditing only, never used in scoring
    age_range: Optional[str] = None
    zip_code: Optional[str] = None
    gender: Optional[str] = None
    ethnicity: Optional[str] = None


class OrchestrateResponse(BaseModel):
    """Raw response envelope from the watsonx Orchestrate Manager Agent."""
    user_id: str
    raw: dict


class CreditReportResponse(BaseModel):
    """Parsed, structured credit report (populated from Orchestrate response)."""
    user_id: str
    score: int
    risk_tier: str
    explanation: str
    positive_factors: List[str]
    negative_factors: List[str]
    bias_report: dict
    alternate_data_summary: dict


class BiasReportResponse(BaseModel):
    user_id: str
    bias_detected: bool
    bias_flags: List[str]
    fairness_score: int
    recommendation: str
