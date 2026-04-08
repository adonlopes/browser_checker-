# Cross-Browser Compatibility Testing Dashboard

A minimal, professional QA tool that runs automated visual tests across 5 browsers, captures full-page screenshots, and compares rendering differences.

## Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React 18 + Tailwind CSS v4 + Vite |
| Backend    | FastAPI + Uvicorn                 |
| Automation | Playwright (Chromium/Firefox/WebKit) |
| Comparison | Pillow (PIL) + NumPy              |

---

## Folder Structure

```
brower_checker/
├── backend/
│   ├── main.py                  # FastAPI app
│   ├── requirements.txt
│   ├── routes/
│   │   └── test_routes.py       # /run-test, /results/:id, /tests
│   ├── automation/
│   │   └── runner.py            # Playwright multi-browser runner
│   └── utils/
│       └── comparator.py        # Image diff using Pillow + NumPy
├── docs/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── main.jsx
│   │   ├── components/
│   │   │   ├── TestForm.jsx     # URL input + browser selection
│   │   │   └── ResultsPanel.jsx # Screenshot grid + diff viewer
│   │   ├── hooks/
│   │   │   └── useBackgroundEffect.js  # Canvas cursor effect
│   │   └── services/
│   │       └── api.js           # Axios API calls
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── screenshots/                 # Captured browser screenshots
├── results/                     # Diff & highlight images
└── README.md
```

---

## Setup & Run

### Backend

```bash
# 1. Create virtual environment
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Install Playwright browsers (Chromium, Firefox, WebKit)
playwright install --with-deps chromium firefox webkit

# 4. Start the API server
uvicorn main:app --reload --port 8000
```

API will be available at: `http://localhost:8000`

---

### Frontend

```bash
# In a new terminal
cd docs
npm install
npm run dev
```

Dashboard will be available at: `http://localhost:5173`

---

## Deployment (Vercel)

This project has been configured for one-click deployment on **Vercel**. 
The repository includes a `vercel.json` file which defines:
- The React frontend (built from `docs/`)
- The FastAPI backend (served via serverless functions from `backend/main.py`)
- Python Vercel support for the read-only file system (`/tmp` mapping)

*Note: Due to Vercel's serverless function size limits (50MB max), installing Playwright's full multi-browser binaries in the cloud requires additional AWS Lambda/Docker setup and may bypass the free tier. This Vercel configuration covers the repository routing correctly.*

---

## API Endpoints

| Method | Endpoint              | Description                           |
|--------|-----------------------|---------------------------------------|
| POST   | `/api/run-test`       | Start a test (url + browsers)         |
| GET    | `/api/results/{id}`   | Poll for results                      |
| GET    | `/api/tests`          | List all test runs                    |
| GET    | `/screenshots/{file}` | Serve screenshot images               |
| GET    | `/results/{file}`     | Serve diff/highlight images           |

---

## Browsers Supported

| Browser         | Engine   | Notes                                      |
|-----------------|----------|--------------------------------------------|
| Google Chrome   | Chromium | Requires Chrome installed (channel: chrome) |
| Mozilla Firefox | Firefox  | Uses bundled Playwright Firefox            |
| Apple Safari    | WebKit   | Uses Playwright WebKit (cross-platform)    |
| Microsoft Edge  | Chromium | Requires Edge installed (channel: msedge)  |
| Brave           | Chromium | Requires Brave installed locally           |

> **Note:** Channels `chrome`, `msedge`, and Brave executable require those browsers to be installed on the host machine. If unavailable, Playwright falls back to its bundled Chromium.

---

## Visual Comparison Logic

| Pixel Diff % | Status | Note                                    |
|--------------|--------|-----------------------------------------|
| 0 – 2%       | PASS   | Visually consistent                     |
| 2 – 8%       | PASS   | Minor layout differences, acceptable    |
| > 8%         | FAIL   | Major UI differences, review required   |

Baseline: **Chrome** screenshots are compared against all other browsers.

---

## Manual Test Cases

### Layout Consistency
- [ ] Verify header alignment across all 5 browsers
- [ ] Check footer position at various viewport widths
- [ ] Confirm navigation links are properly displayed

### CSS Rendering
- [ ] Validate font rendering (anti-aliasing differences)
- [ ] Check flex/grid layout consistency
- [ ] Verify border-radius and shadow rendering

### JavaScript Behavior
- [ ] Confirm dynamic content loads correctly
- [ ] Validate event listeners work across browsers
- [ ] Test form interactions and validations

### Edge Cases
- [ ] Test with very long URLs
- [ ] Test sites with security headers (X-Frame-Options)
- [ ] Test with JavaScript-heavy SPAs
- [ ] Test on slow network simulation
- [ ] Test with browser-specific CSS prefixes

### Exploratory Testing
- [ ] Resize viewport (480px → 1920px)
- [ ] Zoom in/out (50% – 200%)
- [ ] Test with browser extensions disabled vs enabled

---

## Bug Report Template

```
Title: [Brief description]
Browser: [Chrome / Firefox / Safari / Edge / Brave]
URL Tested: [URL]
Steps to Reproduce:
  1. Open URL in [Browser]
  2. [Steps...]
Expected: [What should happen]
Actual: [What actually happened]
Diff %: [From comparison result]
Screenshot: [Attach highlight image]
```
