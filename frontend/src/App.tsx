import { useState, useEffect } from "react";
import { useBarcodeScanner } from "./hooks/useBarcodeScanner";
import { FormatSelector } from "./components/FormatSelector";
import { ImageScanner } from "./components/ImageScanner";
import { ResultSection } from "./components/ResultSection";

function App() {
  const scanner = useBarcodeScanner();
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark" ? "dark" : "light";
  });

  // Apply theme dynamically to documentElement
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className="app-container">
      {/* Theme Switch Control */}
      <button
        className="theme-toggle"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
      >
        {theme === "light" ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        ) : (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        )}
      </button>
      <header className="app-header">
        <img src="/favicon.svg" className="app-logo" alt="Quick Code Lector Logo" />
        <h1 className="app-title">Quick Code Lector</h1>
        <p className="app-subtitle">
          Online barcode & 2D code scanner. Supports QR, DataMatrix, Aztec, EAN, and Postal Codes.
        </p>
      </header>

      <main className="dashboard-card">
        {/* Expected Barcode Format Select Dropdown */}
        <FormatSelector
          value={scanner.barcodeFormat}
          onChange={scanner.setBarcodeFormat}
          disabled={scanner.isScanning}
        />

        {/* Scanner Body: Drag & Drop upload or Live Camera Capture */}
        <ImageScanner
          inputMethod={scanner.inputMethod}
          setInputMethod={scanner.setInputMethod}
          previewUrl={scanner.previewUrl}
          file={scanner.file}
          cameraActive={scanner.cameraActive}
          isScanning={scanner.isScanning}
          handleFileChange={scanner.handleFileChange}
          clearFile={scanner.clearFile}
          startCamera={scanner.startCamera}
          stopCamera={scanner.stopCamera}
          uploadAndDecode={scanner.uploadAndDecode}
          captureAndDecode={scanner.captureAndDecode}
          maxFileSize={scanner.maxFileSize}
        />

        {/* Error notification display */}
        {scanner.error && (
          <div className="status-msg status-error" role="alert">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{scanner.error}</span>
          </div>
        )}

        {/* Loading display */}
        {scanner.isScanning && (
          <div className="status-msg status-loading" role="status">
            <div className="spinner" />
            <span>Scanning code... Processing image...</span>
          </div>
        )}

        {/* Final output content display */}
        {scanner.scanResult && !scanner.isScanning && (
          <ResultSection result={scanner.scanResult} />
        )}

        {/* Restart/Scan Another button */}
        {(scanner.scanResult || scanner.error) && !scanner.isScanning && (
          <button
            className="action-btn btn-secondary"
            style={{ width: "100%", justifyContent: "center", marginTop: "1rem" }}
            onClick={scanner.resetScanner}
            aria-label="Restart and scan another code"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            Scan Another Code
          </button>
        )}
      </main>

      <footer style={{ marginTop: "1.5rem", color: "var(--text-secondary)", fontSize: "0.85rem", textAlign: "center", maxWidth: "600px", lineHeight: "1.4" }}>
        🛡️ <strong>Privacy Notice:</strong> We do not store, log, or save any user data. Images uploaded or captured for barcode scanning are processed entirely in-memory and are immediately discarded after decoding.
      </footer>
    </div>
  );
}

export default App;
