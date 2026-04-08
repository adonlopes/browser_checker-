import os
import asyncio
from typing import List, Dict, Optional
from playwright.async_api import async_playwright

IS_VERCEL = os.environ.get("VERCEL") == "1"
BASE_DIR = "/tmp" if IS_VERCEL else "."

SCREENSHOTS_DIR = os.path.join(BASE_DIR, "screenshots")
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)


def _find_brave() -> Optional[str]:
    """Try to locate the Brave browser executable on common OS paths."""
    paths = [
        "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
        "/usr/bin/brave-browser",
        "/usr/bin/brave",
        r"C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe",
        r"C:\Program Files (x86)\BraveSoftware\Brave-Browser\Application\brave.exe",
    ]
    for p in paths:
        if os.path.exists(p):
            return p
    return None


# Browser configuration: maps logical name -> Playwright launch params
BROWSER_CONFIG = {
    "chrome": {
        "engine": "chromium",
        "channel": "chrome",
        "args": [],
        "executable": None,
    },
    "firefox": {
        "engine": "firefox",
        "channel": None,
        "args": [],
        "executable": None,
    },
    "safari": {
        "engine": "webkit",
        "channel": None,
        "args": [],
        "executable": None,
    },
    "edge": {
        "engine": "chromium",
        "channel": "msedge",
        "args": [],
        "executable": None,
    },
    "brave": {
        "engine": "chromium",
        "channel": None,
        "args": ["--disable-extensions", "--no-first-run"],
        "executable": _find_brave(),
    },
}


async def capture_browser(
    test_id: str,
    url: str,
    browser_name: str,
    playwright,
) -> Dict:
    """Capture a full-page screenshot for one browser."""
    config = BROWSER_CONFIG.get(browser_name, {})
    engine_name = config.get("engine", "chromium")
    channel = config.get("channel")
    executable = config.get("executable")
    launch_args = config.get("args", [])

    engine = getattr(playwright, engine_name)

    launch_kwargs: Dict = {"headless": True, "args": launch_args}
    if channel:
        launch_kwargs["channel"] = channel
    if executable:
        launch_kwargs["executable_path"] = executable

    browser = None
    screenshot_path = None
    error_msg = None

    try:
        try:
            browser = await engine.launch(**launch_kwargs)
        except Exception:
            # Fallback: drop channel & executable, use bundled browser
            fallback_kwargs = {"headless": True, "args": launch_args}
            browser = await engine.launch(**fallback_kwargs)

        context = await browser.new_context(
            viewport={"width": 1440, "height": 900},
            ignore_https_errors=True,
        )
        page = await context.new_page()

        await page.goto(url, wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(1500)

        fname = f"{test_id}_{browser_name}.png"
        full_path = os.path.join(SCREENSHOTS_DIR, fname)
        await page.screenshot(path=full_path, full_page=True)
        screenshot_path = f"/screenshots/{fname}"

        await context.close()

    except Exception as e:
        error_msg = str(e)

    finally:
        if browser:
            await browser.close()

    return {
        "browser": browser_name,
        "screenshot": screenshot_path,
        "error": error_msg,
        "status": "success" if screenshot_path else "error",
    }


async def run_browser_tests(test_id: str, url: str, browsers: List[str]) -> Dict:
    """Run all browser tests concurrently and return screenshot paths keyed by browser name."""
    async with async_playwright() as playwright:
        tasks = [
            capture_browser(test_id, url, browser, playwright)
            for browser in browsers
        ]
        results = await asyncio.gather(*tasks, return_exceptions=True)

    screenshots: Dict = {}
    for i, result in enumerate(results):
        browser = browsers[i]
        if isinstance(result, Exception):
            screenshots[browser] = {
                "browser": browser,
                "screenshot": None,
                "error": str(result),
                "status": "error",
            }
        else:
            screenshots[browser] = result

    return screenshots
