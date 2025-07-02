from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from ask_openai import build_prompt, ask_openai
from api_gateway import call_api
import json

app = FastAPI()

class Message(BaseModel):
    message: str

@app.post("/chat")
async def chat_with_agent(message: Message):
    prompt = build_prompt(message.message)
    llm_response = ask_openai(prompt)

    try:
        parsed = json.loads(llm_response)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="AI returned invalid JSON.")

    if parsed.get("intent") == "missing_info":
        return {"message": f"Missing: {', '.join(parsed['missing'])}"}

    response = await call_api(parsed["intent"], parsed["parameters"])
    return {"response": response.json()}
