import uuid
import asyncio
from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
import json, os

from automation.runner import run_browser_tests
from utils.comparator import compare_screenshots

router = APIRouter()

# In-memory store for test results
test_store: Dict[str, dict] = {}


class TestRequest(BaseModel):
    url: str
    browsers: List[str]


class TestStatus(BaseModel):
    test_id: str
    status: str
    url: str
    browsers: List[str]


@router.post("/run-test")
async def run_test(request: TestRequest, background_tasks: BackgroundTasks):
    """Trigger a cross-browser test run."""
    if not request.url.startswith(("http://", "https://")):
        raise HTTPException(status_code=400, detail="URL must start with http:// or https://")
    if not request.browsers:
        raise HTTPException(status_code=400, detail="At least one browser must be selected")

    test_id = str(uuid.uuid4())
    test_store[test_id] = {
        "test_id": test_id,
        "status": "running",
        "url": request.url,
        "browsers": request.browsers,
        "screenshots": {},
        "comparisons": {},
        "errors": {},
        "summary": {},
        "progress": 0,
    }

    background_tasks.add_task(execute_tests, test_id, request.url, request.browsers)
    return {"test_id": test_id, "status": "running"}


@router.get("/results/{test_id}")
async def get_results(test_id: str):
    """Retrieve results for a given test ID."""
    if test_id not in test_store:
        raise HTTPException(status_code=404, detail="Test not found")
    return test_store[test_id]


@router.get("/tests")
async def list_tests():
    """List all test runs."""
    return list(test_store.values())


async def execute_tests(test_id: str, url: str, browsers: List[str]):
    """Background task that runs all browser tests then compares screenshots."""
    try:
        screenshots = await run_browser_tests(test_id, url, browsers)
        test_store[test_id]["screenshots"] = screenshots
        test_store[test_id]["progress"] = 70

        comparisons = {}
        if "chrome" in screenshots and len(browsers) > 1:
            comparisons = compare_screenshots(test_id, screenshots)

        test_store[test_id]["comparisons"] = comparisons
        test_store[test_id]["progress"] = 100

        # Build summary
        overall_pass = all(c.get("status") == "pass" for c in comparisons.values()) if comparisons else True
        test_store[test_id]["summary"] = {
            "overall_status": "pass" if overall_pass else "fail",
            "browsers_tested": len(browsers),
            "comparisons_made": len(comparisons),
        }
        test_store[test_id]["status"] = "completed"

    except Exception as e:
        test_store[test_id]["status"] = "error"
        test_store[test_id]["errors"]["general"] = str(e)
