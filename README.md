<p align="center">
  <img src="frontend/public/favicon.svg" alt="QuickCodeLector Logo" width="120" height="120" />
</p>

<h1 align="center">QuickCodeLector</h1>

<p align="center">
  <strong>A premium, responsive online barcode and 2D code scanner app.</strong>
</p>

<p align="center">
  <a href="#key-features">Key Features</a> •
  <a href="#architectural-design--solid-principles">Architecture & SOLID</a> •
  <a href="#technology-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#automated-testing">Testing</a>
</p>

---

QuickCodeLector is a robust, responsive web application designed to scan and decode a wide variety of 1D barcodes and 2D matrix codes directly in the web browser. The system leverages HTML5 media capture for live video streams and handles local file uploads, validating and decoding all files securely in-memory on the server.

---

## Key Features

- **Multi-Symbology Support:** Decodes 2D codes (**QR Code, Micro QR, rMQR, Data Matrix, Aztec**) and 1D barcodes (**EAN-13, EAN-8, UPC-A, UPC-E, ITF, Code 128, Code 39, Codabar, PDF417**).
- **Format Filtering & Auto-Detect:** Users can select specific expected formats to optimize reader scan performance or let the engine auto-detect formats (`AUTO`).
- **Dynamic Camera Capture & Auto-Off:** Streams device camera frames (`getUserMedia`) into a static `<video>` feed inside an overlay scanner frame. To preserve hardware resources and privacy, **the camera is shut down immediately after a frame is captured** and before sending the bytes to the backend.
- **Unified Visor Previews:** Once an image is uploaded or captured via the camera, the static image is displayed inside the visor container. Clicking **"Scan Another Code"** clears the results and automatically restarts the camera stream (in camera mode).
- **Environment-Configurable File Size Limits:** Enforces a configurable file size limit (default **2MB**). The backend publishes this limit on `GET /api/settings`, which the React client hook fetches on mount to dynamically update UI hints and apply client-side validations.
- **Light & Dark Themes:** Features a polished layout using Vanilla CSS variables. The page renders in a high-contrast **Light Theme** by default (ideal for daytime scanning) and can be toggled to a neon **Dark Theme** using a floating switcher. State is persisted inside the browser's `localStorage` to prevent visual flashes.
- **Privacy Core:** Images are processed as byte arrays in-memory and are never stored on the server's hard drive.

---

## Architectural Design & SOLID Principles

QuickCodeLector is designed following clean architecture guidelines and strictly implements SOLID:

1. **Single Responsibility Principle (SRP):**
   - **Backend:** Separates routes (`endpoints.py`), serialization schemas (`schemas.py`), settings management (`config.py`), and decoding strategies (`zxing_decoder.py`).
   - **Frontend:** State management, media streams, and fetch queries are encapsulated inside `useBarcodeScanner.ts`. Visual layout grids remain strictly inside pure components.
2. **Open/Closed Principle (OCP):**
   - The decoding backend can extend or replace mapped barcode symbologies by updating the parser list without modifying endpoints or client models.
3. **Liskov Substitution Principle (LSP):**
   - Decoder engines implementing the interface base can be switched safely without impacting endpoint structures.
4. **Interface Segregation Principle (ISP):**
   - Clean, focused interface contracts (`IBarcodeDecoder`) keep dependencies isolated and minimal.
5. **Dependency Inversion Principle (DIP):**
   - API endpoints depend on the `IBarcodeDecoder` abstraction. Concrete classes (`ZXingDecoder`) are supplied dynamically using FastAPI's dependency injection container (`Depends`).

---

## Technology Stack

- **Backend:** Python 3.10+, FastAPI, Uvicorn, Pillow (image manipulation), NumPy, and `zxing-cpp` (modern bindings to ZXing C++).
- **Frontend:** React 19, TypeScript, Vite, Vanilla CSS.
- **Testing:** `pytest` & `FastAPI TestClient` (Backend); `Vitest` & `React Testing Library` (Frontend).

---

## Getting Started

You can run the application either using **Docker & Docker Compose** (recommended) or in a **Local Development Environment**.

### Option A: Running with Docker & Docker Compose (Recommended)

Ensure you have [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed.

1. **Build and start the containers** from the root project directory:
   ```bash
   docker-compose up --build
   ```
2. **Access the application:**
   - **Frontend Web UI:** Go to [http://localhost:8080](http://localhost:8080)
   - **Backend API Docs (Swagger):** Go to [http://localhost:8000/docs](http://localhost:8000/docs)
3. **Shutdown the services:**
   ```bash
   docker-compose down
   ```

*(You can configure the file size limit inside the `docker-compose.yml` file under the backend service's environment variables: `MAX_FILE_SIZE_BYTES`)*

---

### Option B: Running in a Local Development Environment

#### Backend Setup & Launch

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create and activate a local Python virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install package requirements:
   ```bash
   pip install -r requirements.txt
   ```
4. (Optional) Configure maximum file size limits in bytes (Default is 2MB):
   ```bash
   export MAX_FILE_SIZE_BYTES=2097152
   ```
5. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

#### Frontend Setup & Launch

1. Navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The local web UI will be live at [http://localhost:5173](http://localhost:5173).*

---

## Automated Testing

Comprehensive test suites are included to prevent regressions across both stacks.

### Executing Backend Tests (Pytest)
From the `backend` directory with the virtual environment active:
```bash
pytest tests/
```

### Executing Frontend Tests (Vitest)
From the `frontend` directory:
```bash
npm run test     # Or: npx vitest run
```
