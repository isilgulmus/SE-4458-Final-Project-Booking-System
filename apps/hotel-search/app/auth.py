import jwt, os
from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.security.utils import get_authorization_scheme_param

SECRET_KEY = os.getenv("SECRET_KEY", "supersecret")
ALGORITHM = "HS256"
security = HTTPBearer()

async def get_optional_user(request: Request):
    auth = request.headers.get("Authorization")
    scheme, token = get_authorization_scheme_param(auth)

    if not token or scheme.lower() != "bearer":
        return None

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return {
            "username": payload.get("sub"),
            "role": payload.get("role", "user"),
            "id": payload.get("id")
        }
    except jwt.PyJWTError:
        return None
