import jwt, os
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

SECRET = os.getenv("SECRET_KEY", "supersecret")
ALGORITHM = "HS256"
security = HTTPBearer()

def create_token(data: dict):
    return jwt.encode(data, SECRET, algorithm=ALGORITHM)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET, algorithms=[ALGORITHM])
        return {
            "username": payload["sub"],
            "role": payload.get("role", "user"),
            "id": payload.get("id")  # 👈 Artık user_id de payload içinde
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def require_role(role: str):
    def wrapper(user: dict = Depends(get_current_user)):
        if user["role"] != role:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user
    return wrapper
