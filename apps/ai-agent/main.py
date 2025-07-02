from fastapi import FastAPI, HTTPException, Depends, Request
from pydantic import BaseModel
from ask_openai import build_prompt, ask_openai
import json
import sys
import os
from datetime import datetime
from auth import get_current_user
from fastapi.middleware.cors import CORSMiddleware

sys.path.append(os.path.dirname(__file__))

from api_gateway import call_api

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Message(BaseModel):
    message: str

@app.post("/chat")
async def chat_with_agent(
    message: Message,
    request: Request,
    user: dict = Depends(get_current_user)  
):
    try:
        prompt = build_prompt(message.message)
        llm_response = ask_openai(prompt)

        try:
            data = json.loads(llm_response)
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=400, detail=f"Invalid JSON from OpenAI: {e}")

        print(f"[DEBUG] Parsed LLM JSON: {data}")

        if data.get("intent") == "missing_info":
            missing = data.get("missing", [])
            return {"message": f"Missing required fields: {', '.join(missing)}"}

        intent = data.get("intent")
        params = data.get("parameters")

        if not intent or not params:
            raise HTTPException(status_code=400, detail="Missing 'intent' or 'parameters' in OpenAI response")

        for key in ("start_date", "end_date"):
            if key in params:
                try:
                    datetime.fromisoformat(params[key])
                except ValueError:
                    raise HTTPException(status_code=400, detail=f"Invalid date format in '{key}', expected ISO format (YYYY-MM-DD)")

        # intent: search_hotel
        if intent == "search_hotel":
            response = await call_api("search_hotel", params, request)
            result_data = response.json()
            hotels = result_data.get("results", [])

            if not hotels:
                loc = params.get("location", "the selected location")
                start = params.get("start_date", "")
                end = params.get("end_date", "")
                guests = params.get("guest_count", "?")
                return {
                    "message": f"Sorry, no hotels found in {loc} between {start} and {end} for {guests} guests."
                }

            summary_lines = []
            for h in hotels[:5]:
                hotel_name = h["hotel_name"]
                room_type = h["room_type"]
                final_price = h["final_price"]
                original_price = h["price_per_night"] * (
                    datetime.fromisoformat(params["end_date"]) - datetime.fromisoformat(params["start_date"])
                ).days
                is_discounted = h.get("discounted_for") is not None

                if is_discounted:
                    line = f"- 🏨 {hotel_name} ({room_type}): ~~{original_price:.2f} USD~~ **{final_price:.2f} USD** (15% discount)"
                else:
                    line = f"- 🏨 {hotel_name} ({room_type}): {final_price:.2f} USD"

                summary_lines.append(line)

            location = params.get("location", "the destination")
            start = params.get("start_date", "")
            end = params.get("end_date", "")
            guest_count = params.get("guest_count", "?")

            if hotels[0].get("discounted_for"):
                intro = f"Great news! I found {len(hotels)} hotel option(s) in {location} between {start} and {end} for {guest_count} guests:"
                ending = "Would you like me to proceed with the reservation?"
            else:
                intro = f"I found {len(hotels)} hotel option(s) in {location} between {start} and {end} for {guest_count} guests:"
                ending = "Let me know if you'd like to book it!"

            return {
                "message": f"{intro}\n\n" + "\n".join(summary_lines) + f"\n\n{ending}"
            }

        # intent: book_hotel
        elif intent == "book_hotel":
            required_fields = ["room_id", "start_date", "end_date", "guest_count"]
            missing = [field for field in required_fields if field not in params]
            if missing:
                return {"message": f"Missing booking parameters: {', '.join(missing)}"}

            try:
                response = await call_api("book_hotel", params, request)
                booking_data = response.json()

                room_id = params["room_id"]
                start = params["start_date"]
                end = params["end_date"]
                guests = params["guest_count"]
                price = booking_data.get("total_price", "N/A")

                return {
                    "message": f"Your reservation for room {room_id} from {start} to {end} for {guests} guests has been confirmed. Total price: {price} USD."
                }

            except Exception as e:
                error_text = str(e)
                if "No availability for" in error_text:
                    unavailable_date = error_text.split("No availability for")[-1].strip(' ."}')
                    return {
                        "message": f"Unfortunately, the selected room is not available on {unavailable_date}. Please try a different date range."
                    }
                raise

        # intent: other
        else:
            response = await call_api(intent, params, request)
            return {"response": response.json()}

    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Unexpected failure: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
