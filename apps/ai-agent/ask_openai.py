import os
import openai
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

if not openai.api_key:
    raise ValueError("❌ OPENAI_API_KEY is missing. Check your .env file.")

def build_prompt(message: str) -> str:
    return f"""
You are a hotel assistant AI. Extract user's intent and parameters from the input.

Supported intents:
- search_hotel: location, start_date, end_date, guest_count
- book_hotel: room_id, start_date, end_date, guest_count

Return ONLY valid JSON in the following format:

If all required data is available:
{{
  "intent": "search_hotel",
  "parameters": {{
    "location": "Izmir",
    "start_date": "2025-08-10",
    "end_date": "2025-08-12",
    "guest_count": 2
  }}
}}

If any data is missing:
{{
  "intent": "missing_info",
  "missing": ["start_date", "end_date"]
}}

Do NOT include any explanations. JSON only.

User input: "{message}"
""".strip()

def ask_openai(prompt: str) -> str:
    print(f"[LLM PROMPT] >>>\n{prompt}\n<<<")

    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
    )

    content = response.choices[0].message.content.strip()
    print(f"[LLM RESPONSE] <<<\n{content}\n>>>")
    return content
