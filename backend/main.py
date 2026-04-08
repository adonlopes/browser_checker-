import os
import uuid
import asyncio
from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional

from routes.test_routes import router as test_router

app = FastAPI(title="Cross-Browser Compatibility Testing Dashboard", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Check if running on Vercel
IS_VERCEL = os.environ.get("VERCEL") == "1"
BASE_DIR = "/tmp" if IS_VERCEL else "."

SCREENSHOTS_DIR = os.path.join(BASE_DIR, "screenshots")
RESULTS_DIR = os.path.join(BASE_DIR, "results")

# Static file serving for screenshots/results
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)
os.makedirs(RESULTS_DIR, exist_ok=True)

app.mount("/screenshots", StaticFiles(directory=SCREENSHOTS_DIR), name="screenshots")
app.mount("/results", StaticFiles(directory=RESULTS_DIR), name="results")

app.include_router(test_router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "Cross-Browser Compatibility Testing Dashboard API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=10000)
