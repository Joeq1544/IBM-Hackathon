from services.alternate_data import AlternateDataService


class DataCollectorAgent:
    """
    Collects and normalizes alternate credit data for thin-file individuals.
    Sources: rent history, utilities, bank transactions, education, employment.
    """

    def __init__(self):
        self.service = AlternateDataService()

    async def run(self, user_data: dict) -> dict:
        rent = self.service.get_rent_history(user_data.get("user_id"))
        utilities = self.service.get_utility_payments(user_data.get("user_id"))
        bank = self.service.get_bank_transactions(user_data.get("user_id"))
        education = self.service.get_education_record(user_data.get("user_id"))
        employment = self.service.get_employment_record(user_data.get("user_id"))

        return {
            "rent_history": rent,
            "utility_payments": utilities,
            "bank_transactions": bank,
            "education": education,
            "employment": employment,
        }
