"""
Data routes — called by the Data Collection Agent in watsonx Orchestrate as Skills.
For the hackathon demo these return mock data. In production they would call
Plaid, utility APIs, university enrollment APIs, etc.
"""

from fastapi import APIRouter, HTTPException
from services.alternate_data import AlternateDataService

router = APIRouter()
_service = AlternateDataService()


@router.get("/bank/{user_id}")
def get_bank_data(user_id: str):
    data = _service.get_bank_transactions(user_id)
    if not data:
        raise HTTPException(status_code=404, detail="No bank data found")
    return data


@router.get("/rent/{user_id}")
def get_rent_history(user_id: str):
    return _service.get_rent_history(user_id)


@router.get("/utilities/{user_id}")
def get_utility_payments(user_id: str):
    return _service.get_utility_payments(user_id)


@router.get("/education/{user_id}")
def get_education_record(user_id: str):
    return _service.get_education_record(user_id)


@router.get("/employment/{user_id}")
def get_employment_record(user_id: str):
    return _service.get_employment_record(user_id)
