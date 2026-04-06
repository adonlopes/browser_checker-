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

# Static file serving for screenshots/results
os.makedirs("screenshots", exist_ok=True)
os.makedirs("results", exist_ok=True)

app.mount("/screenshots", StaticFiles(directory="screenshots"), name="screenshots")
app.mount("/results", StaticFiles(directory="results"), name="results")

app.include_router(test_router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "Cross-Browser Compatibility Testing Dashboard API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "ok"}
