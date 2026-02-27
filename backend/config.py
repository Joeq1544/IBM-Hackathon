import os
from dotenv import load_dotenv

load_dotenv()

# IBM Cloud auth
IBM_API_KEY = os.getenv("IBM_API_KEY")
IBM_IAM_URL = "https://iam.cloud.ibm.com/identity/token"

# watsonx Orchestrate — Manager Agent is the single entry point from the backend
ORCHESTRATE_BASE_URL = os.getenv("ORCHESTRATE_BASE_URL", "https://api.ibm.com/watsonx-orchestrate/run/v1")
ORCHESTRATE_MANAGER_AGENT_ID = os.getenv("ORCHESTRATE_MANAGER_AGENT_ID")

# watsonx.ai (kept for any direct model calls if needed)
WATSONX_PROJECT_ID = os.getenv("WATSONX_PROJECT_ID")
WATSONX_URL = os.getenv("WATSONX_URL", "https://us-south.ml.cloud.ibm.com")
GRANITE_INSTRUCT_MODEL = "ibm/granite-3-2-8b-instruct"
GRANITE_GUARDIAN_MODEL = "ibm/granite-guardian-3-2-8b"
