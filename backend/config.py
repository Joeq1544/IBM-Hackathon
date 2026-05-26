import os
from dotenv import load_dotenv, find_dotenv

# Search upward from backend/ to find the root .env
load_dotenv(find_dotenv())

# Google Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
