from fastapi import APIRouter, Request
from .service import get_groq_response
from .voice_assistant.service import VoiceAssistantService


router = APIRouter()

@router.post("/chat")
async def chat(request: Request):
    data = await request.json()
    message = data.get("message")
    
    print(f"DEBUG: Received message from frontend -> '{message}'")
    
    if not message or str(message).strip() == "":
        return {"error": "Message not provided"}
    response = get_groq_response(message)
    return response

@router.post("/voice")
async def voice(request: Request):
    data = await request.json()
    message = data.get("message")
    
    print(f"DEBUG: Received message from frontend -> '{message}'")
    
    if not message or str(message).strip() == "":
        return {"error": "Message not provided"}
    
    voice_service = VoiceAssistantService()
    response = voice_service.process_message(message)
    return response
