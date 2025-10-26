from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import os
from typing import List, Optional
import json
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="GenAI Chatbot API")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    conversation_history: List[ChatMessage] = []

class ChatResponse(BaseModel):
    response: str
    status: str = "success"

# Free AI API endpoints - using multiple providers for fallback
AI_PROVIDERS = [
    {
        "name": "Groq (Free & Fast)",
        "url": "https://api.groq.com/openai/v1/chat/completions",
        "headers": {"Authorization": f"Bearer {os.getenv('GROQ_API_KEY')}"},
        "enabled": bool(os.getenv('GROQ_API_KEY'))
    },
    # {
    #     "name": "Together AI (Free)",
    #     "url": "https://api.together.xyz/v1/chat/completions",
    #     "headers": {"Authorization": f"Bearer {os.getenv('TOGETHER_API_KEY')}"},
    #     "enabled": bool(os.getenv('TOGETHER_API_KEY'))
    # },
    # {
    #     "name": "OpenAI (Paid)",
    #     "url": "https://api.openai.com/v1/chat/completions",
    #     "headers": {"Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}"},
    #     "enabled": bool(os.getenv('OPENAI_API_KEY'))
    # },
    # {
    #     "name": "HuggingFace - Simple Test",
    #     "url": "https://api-inference.huggingface.co/models/microsoft/DialoGPT-small",
    #     "headers": {"Authorization": f"Bearer {os.getenv('HUGGINGFACE_TOKEN')}"},
    #     "enabled": bool(os.getenv('HUGGINGFACE_TOKEN'))
    # }
]

# Simple rule-based fallback AI
def simple_ai_response(message: str) -> str:
    """Simple rule-based chatbot as fallback"""
    message_lower = message.lower()

    if any(word in message_lower for word in ["hello", "hi", "hey"]):
        return "Hello! I'm your AI assistant. How can I help you today?"

    elif any(word in message_lower for word in ["python", "programming", "code"]):
        return "I'd be happy to help with Python programming! What specific topic would you like to discuss? I can help with data science, web development, AI/ML, or general programming concepts."

    elif any(word in message_lower for word in ["machine learning", "ml", "ai", "artificial intelligence"]):
        return "Machine Learning is fascinating! I can discuss topics like supervised learning, neural networks, deep learning frameworks like TensorFlow and PyTorch, or help you understand ML concepts."

    elif any(word in message_lower for word in ["data science", "pandas", "numpy"]):
        return "Data Science is a powerful field! I can help with pandas for data manipulation, numpy for numerical computing, matplotlib/seaborn for visualization, or statistical analysis techniques."

    elif any(word in message_lower for word in ["web development", "fastapi", "flask", "django"]):
        return "Web development with Python is great! I can discuss FastAPI for modern APIs, Django for full-stack applications, Flask for lightweight projects, or REST API design principles."

    elif "?" in message:
        return "That's an interesting question! While I'm running in demo mode with basic responses, I'm designed to help with programming, data science, AI/ML, and general technical topics. Could you be more specific about what you'd like to know?"

    else:
        return "I understand you're interested in discussing this topic. In full mode, I'd provide detailed insights, but currently I'm running with basic responses. Feel free to ask about Python, AI, data science, or web development!"

async def call_ai_api(message: str, history: List[ChatMessage]) -> str:
    """Try to call external AI APIs, fallback to simple responses"""

    print(f"DEBUG: Attempting to call AI APIs for message: {message[:50]}...")
    print(f"DEBUG: OpenAI key exists: {bool(os.getenv('OPENAI_API_KEY'))}")
    print(f"DEBUG: HF token exists: {bool(os.getenv('HUGGINGFACE_TOKEN'))}")
    print(f"DEBUG: Groq key exists: {bool(os.getenv('GROQ_API_KEY'))}")
    print(f"DEBUG: Together key exists: {bool(os.getenv('TOGETHER_API_KEY'))}")

    # Debug environment variables
    groq_key = os.getenv('GROQ_API_KEY')
    if groq_key:
        print(f"DEBUG: Groq key starts with: {groq_key[:10]}...")
    else:
        print("DEBUG: Groq key is None or empty")

    # Debug HF token format
    hf_token = os.getenv('HUGGINGFACE_TOKEN')
    if hf_token:
        print(f"DEBUG: HF token starts with: {hf_token[:10]}...")
        print(f"DEBUG: HF token length: {len(hf_token)}")
    else:
        print("DEBUG: HF token is None or empty")

    for provider in AI_PROVIDERS:
        if not provider["enabled"]:
            print(f"DEBUG: Provider {provider['name']} is disabled")
            continue

        print(f"DEBUG: Trying provider: {provider['name']}")

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                if "openai" in provider["url"] or "groq" in provider["url"] or "together" in provider["url"]:
                    # OpenAI-compatible format (works for OpenAI, Groq, Together AI)
                    messages = [{"role": msg.role, "content": msg.content} for msg in history[-5:]]
                    messages.append({"role": "user", "content": message})

                    # Different models for different providers
                    if "groq" in provider["url"]:
                        model = "llama-3.1-8b-instant"  # Updated Groq model
                    elif "together" in provider["url"]:
                        model = "meta-llama/Llama-2-7b-chat-hf"  # Together AI model
                    else:
                        model = "gpt-3.5-turbo"  # OpenAI model

                    payload = {
                        "model": model,
                        "messages": messages,
                        "max_tokens": 2000,  # Increased from 150 to 2000 for complete responses
                        "temperature": 0.7
                    }

                    print(f"DEBUG: Sending request to {provider['name']} with model {model}")
                    response = await client.post(provider["url"], json=payload, headers=provider["headers"])
                    print(f"DEBUG: {provider['name']} response status: {response.status_code}")

                    if response.status_code == 200:
                        data = response.json()
                        ai_response = data["choices"][0]["message"]["content"]
                        print(f"DEBUG: {provider['name']} success! Response: {ai_response[:100]}...")
                        return ai_response
                    else:
                        print(f"DEBUG: {provider['name']} error: {response.text}")

                elif "huggingface" in provider["url"]:
                    # Simplified Hugging Face approach - minimal payload
                    payload = {"inputs": message}

                    print(f"DEBUG: Sending simplified HF request to {provider['name']}")
                    print(f"DEBUG: HF simplified payload: {payload}")
                    response = await client.post(provider["url"], json=payload, headers=provider["headers"])
                    print(f"DEBUG: HF response status: {response.status_code}")

                    if response.status_code == 200:
                        data = response.json()
                        print(f"DEBUG: HF raw response: {data}")

                        # Handle different response formats
                        if isinstance(data, list) and len(data) > 0:
                            if isinstance(data[0], dict) and "generated_text" in data[0]:
                                ai_response = data[0]["generated_text"].strip()
                                # Remove the input text if it's included in the response
                                if ai_response.startswith(message):
                                    ai_response = ai_response[len(message):].strip()
                                if ai_response and len(ai_response) > 0:
                                    print(f"DEBUG: HF success! Response: {ai_response[:100]}...")
                                    return ai_response

                        # Alternative response format
                        elif isinstance(data, dict) and "generated_text" in data:
                            ai_response = data["generated_text"].strip()
                            if ai_response.startswith(message):
                                ai_response = ai_response[len(message):].strip()
                            if ai_response and len(ai_response) > 0:
                                print(f"DEBUG: HF success! Response: {ai_response[:100]}...")
                                return ai_response

                        print(f"DEBUG: HF response format not recognized or empty")
                    else:
                        print(f"DEBUG: HF error response: {response.text}")
                        if response.status_code == 503:
                            print("DEBUG: Model is loading, waiting...")
                            continue
                        elif response.status_code == 401:
                            print("DEBUG: Authentication error - check HF token")
                            continue
                        elif response.status_code == 404:
                            print("DEBUG: Model not found - trying different endpoint...")
                            # Try alternative endpoint format
                            alt_url = provider["url"].replace("/models/", "/pipeline/text-generation/")
                            print(f"DEBUG: Trying alternative URL: {alt_url}")
                            alt_response = await client.post(alt_url, json=payload, headers=provider["headers"])
                            print(f"DEBUG: Alternative endpoint status: {alt_response.status_code}")
                            if alt_response.status_code == 200:
                                alt_data = alt_response.json()
                                print(f"DEBUG: Alternative endpoint response: {alt_data}")
                            continue

        except Exception as e:
            print(f"DEBUG: Error with {provider['name']}: {str(e)}")
            continue

    print("DEBUG: All providers failed, using fallback")
    # Fallback to simple AI
    return simple_ai_response(message)

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        if not request.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")

        # Get AI response
        ai_response = await call_ai_api(request.message, request.conversation_history)

        return ChatResponse(response=ai_response)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")

@app.get("/api/status")
async def get_status():
    enabled_providers = [p["name"] for p in AI_PROVIDERS if p["enabled"]]
    return {
        "status": "online",
        "ai_providers": enabled_providers if enabled_providers else ["Simple Rule-Based AI (Demo Mode)"],
        "message": "Chatbot API is running"
    }

@app.get("/")
async def root():
    return {"message": "GenAI Chatbot API", "docs": "/docs"}
