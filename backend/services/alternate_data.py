"""
AlternateDataService — provides alternate credit data for thin-file individuals.
For the hackathon demo, this returns mock data keyed by user_id.
In production, these methods would call Plaid, utility APIs, university APIs, etc.
"""

MOCK_DATA = {
    "demo_user_1": {
        "rent": {"months_total": 24, "months_on_time": 23, "monthly_amount": 850},
        "utilities": {"accounts": 2, "months_on_time": 22, "months_total": 24},
        "bank": {"avg_monthly_income": 2200, "avg_monthly_expenses": 1800, "overdrafts_last_year": 1},
        "education": {"enrolled": True, "institution": "Ohio State University", "gpa": 3.4},
        "employment": {"employed": True, "months": 18, "employer": "Part-time campus job"},
    }
}

DEFAULT_DATA = {
    "rent": {"months_total": 0, "months_on_time": 0, "monthly_amount": 0},
    "utilities": {"accounts": 0, "months_on_time": 0, "months_total": 0},
    "bank": {"avg_monthly_income": 0, "avg_monthly_expenses": 0, "overdrafts_last_year": 0},
    "education": {"enrolled": False, "institution": None, "gpa": None},
    "employment": {"employed": False, "months": 0, "employer": None},
}


class AlternateDataService:

    def _get(self, user_id: str, key: str) -> dict:
        return MOCK_DATA.get(user_id, DEFAULT_DATA).get(key, DEFAULT_DATA[key])

    def get_rent_history(self, user_id: str) -> dict:
        return self._get(user_id, "rent")

    def get_utility_payments(self, user_id: str) -> dict:
        return self._get(user_id, "utilities")

    def get_bank_transactions(self, user_id: str) -> dict:
        return self._get(user_id, "bank")

    def get_education_record(self, user_id: str) -> dict:
        return self._get(user_id, "education")

    def get_employment_record(self, user_id: str) -> dict:
        return self._get(user_id, "employment")
