import os
import httpx
from dotenv import load_dotenv
from fastapi import Request

load_dotenv()

API_BASE = os.getenv("GATEWAY_URL", "http://api-gateway:8080/api").rstrip('/')
print(f"[ENV] GATEWAY_URL: {API_BASE}")

async def call_api(intent: str, params: dict, request: Request):
    headers = {}

    # Authorization header'ı varsa ilet
    if "authorization" in request.headers:
        headers["authorization"] = request.headers["authorization"]

    async with httpx.AsyncClient() as client:
        try:
            if intent == "search_hotel":
                url = f"{API_BASE}/search/"
                print(f"[DEBUG] Calling: {url}")
                print(f"[DEBUG] Payload: {params}")
                response = await client.post(url, json=params, headers=headers)

            elif intent == "book_hotel":
                url = f"{API_BASE}/book"
                print(f"[DEBUG] Calling: {url}")
                print(f"[DEBUG] Payload: {params}")
                response = await client.post(url, json=params, headers=headers)

            elif intent == "view_comments":
                hotel_name = params.get("hotel_name")
                url = f"{API_BASE}/comments/{hotel_name}"
                print(f"[DEBUG] Calling: {url}")
                response = await client.get(url, headers=headers)

            else:
                raise ValueError(f"Unknown intent: {intent}")

            print(f"[DEBUG] Response Status: {response.status_code}")
            response.raise_for_status()
            return response

        except httpx.HTTPStatusError as e:
            print(f"[ERROR] API call failed: {e.response.status_code} - {e.response.text}")
            raise Exception(f"❌ API returned error: {e.response.status_code} - {e.response.text}")

        except Exception as e:
            print(f"[FATAL] Unexpected error: {str(e)}")
            raise
