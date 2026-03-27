from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from chatbot.router import router # Ensure this matches your actual import

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Allow requests from your React app
    allow_credentials=True,
    allow_methods=["*"], # Allow all methods (GET, POST, etc.)
    allow_headers=["*"], # Allow all headers
)

# Include the router containing your /chat endpoint
app.include_router(router)
