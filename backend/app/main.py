from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.endpoints import router as api_router

app = FastAPI(
    title="QuickCodeLector REST API",
    description="Backend API for decoding barcodes and 2D codes from uploaded images.",
    version="1.0.0"
)

# Configure CORS
# Allow requests from local frontend (typical Vite default is localhost:5173 or localhost:3000)
# We can allow all origins or restrict to local origins for security.
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For demo / development convenience. Restrict in production.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(api_router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "status": "healthy",
        "service": "QuickCodeLector API",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
