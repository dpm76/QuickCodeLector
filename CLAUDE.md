# CLAUDE.md - AI Agent Guidelines

This document provides quick-reference commands and structural constraints to guide AI agents during development on the **QuickCodeLector** codebase.

---

## Technical Context
- **Backend:** Python 3 (FastAPI, Uvicorn, Pillow, NumPy, zxing-cpp, pytest).
- **Frontend:** React 19 (TypeScript, Vite, Vanilla CSS, Vitest, React Testing Library).

---

## Development Commands

### Docker Commands (Orchestrated Stack)
- **Build and Run Stack:** `docker-compose up --build`
- **Shut down Stack:** `docker-compose down`

### Backend Commands (Local)
- **Activate Virtual Env:** `source backend/venv/bin/activate`
- **Install Dependencies:** `pip install -r backend/requirements.txt`
- **Run API Server:** `uvicorn app.main:app --reload --port 8000` (run from `backend/`)
- **Run Unit Tests:** `pytest tests/` (run from `backend/`)

### Frontend Commands (Local)
- **Install NPM Packages:** `npm install` (run from `frontend/`)
- **Run Dev Server:** `npm run dev` (run from `frontend/`)
- **Build Production Bundle:** `npm run build` (run from `frontend/`)
- **Run Component Tests:** `npx vitest run` (run from `frontend/`)

---

## Core Architecture & Implementation Rules

AI agents must strictly follow these rules to avoid compile or runtime regressions:

### 1. Typescript Compiler Constraints (verbatimModuleSyntax)
- The project enforces `verbatimModuleSyntax`. All type imports from other modules **must** use the type-only import syntax.
  - *Correct:* `import type { InputMethod, ScanResult } from "../hooks/useBarcodeScanner";`
  - *Incorrect:* `import { InputMethod } from "../hooks/useBarcodeScanner";`
- Any modification to `vite.config.ts` must import `defineConfig` from `vitest/config` instead of `vite` to avoid type errors on the `test` block.

### 2. Camera Life Cycle & Capture Sequence
- When a frame is captured from the camera feed:
  1. The frame is drawn to a canvas and converted to a `File` object (`camera_capture.png`).
  2. **Immediately stop the camera** by calling `stopCamera()` to turn off the hardware recording tracks.
  3. Generate a local preview URL using `URL.createObjectURL(file)` and store it in `previewUrl` (and store the file in `file` state).
  4. Send the file bytes to `/api/decode` in the background.
- If `previewUrl` is present in camera mode, the UI **must** render this preview image container instead of the `<video>` tag feed, providing instant capture feedback.

### 3. Scanner Reset & Memory Management (Recomenzar)
- The hook exposes `resetScanner()`. When resetting:
  - Clear `file`, `scanResult`, and `error` states.
  - **Memory Safety:** If `previewUrl` is present, you must call `URL.revokeObjectURL(previewUrl)` to release browser memory pointers before setting `previewUrl = null`.
  - **Auto-Restart:** If the user is currently in `"camera"` mode, `resetScanner` must automatically call `startCamera()` to activate the video tracks for the next scan.

### 4. Settings Synchronization
- The backend configures limits via `Settings` (class in `app/core/config.py` mapping to `MAX_FILE_SIZE_BYTES` environment variables, defaulting to 2MB).
- The backend serves this limit at GET `/api/settings`. The frontend hook **must** fetch this setting on mount to apply matching dynamic client-side file size checks in the dropzone.

### 5. Styling & Logo Placement
- The logo favicon (`/favicon.svg`) sits **above** the title `<h1>` inside the `.app-header` column flex container and is styled to `5.5rem` with a pulsing animation (`pulse-icon`).
- Maintain Vanilla CSS custom properties in `src/index.css`. Theme states switch via a floating circular toggle button setting `data-theme` to `light` (default) or `dark` and syncing state to `localStorage`.
