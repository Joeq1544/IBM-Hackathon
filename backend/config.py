import os
from dotenv import load_dotenv

load_dotenv()

IBM_API_KEY = os.getenv("IBM_API_KEY")
WATSONX_PROJECT_ID = os.getenv("WATSONX_PROJECT_ID")
WATSONX_URL = os.getenv("WATSONX_URL", "https://us-south.ml.cloud.ibm.com")

GRANITE_INSTRUCT_MODEL = "ibm/granite-3-2-8b-instruct"
GRANITE_GUARDIAN_MODEL = "ibm/granite-guardian-3-2-8b"
