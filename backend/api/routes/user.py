from fastapi import APIRouter, HTTPException
from api.schemas import UserSubmission

router = APIRouter()

# In-memory store for hackathon demo
_users: dict = {}


@router.post("/")
async def create_user(user: UserSubmission):
    _users[user.user_id] = user.model_dump()
    return {"message": "User created", "user_id": user.user_id}


@router.get("/{user_id}")
async def get_user(user_id: str):
    if user_id not in _users:
        raise HTTPException(status_code=404, detail="User not found")
    return _users[user_id]
