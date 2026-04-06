import os
import numpy as np
from PIL import Image, ImageChops, ImageFilter, ImageEnhance
from typing import Dict

RESULTS_DIR = "results"
SCREENSHOTS_DIR = "screenshots"
os.makedirs(RESULTS_DIR, exist_ok=True)

DIFF_THRESHOLD_PASS = 2.0     # % of pixels different → PASS
DIFF_THRESHOLD_WARN = 8.0     # % of pixels different → WARN (PASS with note)
# Above WARN → FAIL


def load_image(path: str) -> Image.Image:
    """Load image from relative screenshot path."""
    local = path.lstrip("/")
    return Image.open(local).convert("RGB")


def resize_to_match(img1: Image.Image, img2: Image.Image):
    """Resize both images to the smaller common size."""
    w = min(img1.width, img2.width)
    h = min(img1.height, img2.height)
    return img1.resize((w, h), Image.LANCZOS), img2.resize((w, h), Image.LANCZOS)


def compute_diff(img1: Image.Image, img2: Image.Image) -> Dict:
    """Compute pixel-level diff between two images."""
    img1, img2 = resize_to_match(img1, img2)

    arr1 = np.array(img1, dtype=np.float32)
    arr2 = np.array(img2, dtype=np.float32)

    diff_arr = np.abs(arr1 - arr2)
    diff_gray = diff_arr.mean(axis=2)  # average across RGB channels

    total_pixels = diff_gray.size
    significant_pixels = int((diff_gray > 15).sum())  # threshold: 15/255
    diff_percent = (significant_pixels / total_pixels) * 100

    # Build diff image
    diff_normalized = (diff_gray / diff_gray.max() * 255).astype(np.uint8) if diff_gray.max() > 0 else diff_gray.astype(np.uint8)
    diff_img = Image.fromarray(diff_normalized, mode="L").convert("RGB")

    # Highlight differences in red on baseline
    highlight = img1.copy()
    highlight_arr = np.array(highlight)
    mask = diff_gray > 15
    highlight_arr[mask] = [255, 0, 0]
    highlight_img = Image.fromarray(highlight_arr.astype(np.uint8))

    return {
        "diff_percent": round(diff_percent, 2),
        "significant_pixels": significant_pixels,
        "total_pixels": total_pixels,
        "diff_image": diff_img,
        "highlight_image": highlight_img,
    }


def status_from_diff(diff_percent: float) -> tuple:
    if diff_percent <= DIFF_THRESHOLD_PASS:
        return "pass", "Minimal differences — visually consistent."
    elif diff_percent <= DIFF_THRESHOLD_WARN:
        return "pass", f"Minor layout differences ({diff_percent:.1f}%) — acceptable."
    else:
        return "fail", f"Major UI differences detected ({diff_percent:.1f}%) — review required."


def compare_screenshots(test_id: str, screenshots: Dict) -> Dict:
    """Compare all browser screenshots against each other."""
    import itertools
    comparisons = {}
    
    # Load all successful screenshots
    valid_browsers = []
    images = {}
    for browser, info in screenshots.items():
        if info.get("screenshot"):
            try:
                images[browser] = load_image(info["screenshot"])
                valid_browsers.append(browser)
            except Exception:
                pass
                
    # Compare every unique pair (N chose 2 combinations)
    for b1, b2 in itertools.combinations(valid_browsers, 2):
        key = f"{b1}_vs_{b2}"
        try:
            result = compute_diff(images[b1], images[b2])
            
            diff_fname = f"{test_id}_{b1}_vs_{b2}_diff.png"
            highlight_fname = f"{test_id}_{b1}_vs_{b2}_highlight.png"
            diff_path = os.path.join(RESULTS_DIR, diff_fname)
            highlight_path = os.path.join(RESULTS_DIR, highlight_fname)

            result["diff_image"].save(diff_path)
            result["highlight_image"].save(highlight_path)

            status, note = status_from_diff(result["diff_percent"])
            comparisons[key] = {
                "status": status,
                "note": note,
                "diff_percent": result["diff_percent"],
                "significant_pixels": result["significant_pixels"],
                "total_pixels": result["total_pixels"],
                "diff_image": f"/results/{diff_fname}",
                "highlight_image": f"/results/{highlight_fname}",
                "browsers": [b1, b2],
            }
        except Exception as e:
            comparisons[key] = {
                "status": "error",
                "note": str(e),
                "diff_percent": None,
                "browsers": [b1, b2],
            }

    return comparisons
