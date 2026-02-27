from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import credit, user, audit, data

app = FastAPI(
    title="Credit Path Finder API",
    description="Agentic AI for alternate credit scoring — IBM Hackathon 2026",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(credit.router, prefix="/api/credit", tags=["Credit"])
app.include_router(user.router, prefix="/api/user", tags=["User"])
app.include_router(audit.router, prefix="/api/audit", tags=["Audit"])
app.include_router(data.router, prefix="/api/data", tags=["Data"])


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Credit Path Finder"}
