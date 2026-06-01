import React, { useState, useEffect, useRef } from "react";
import type { ScanResult } from "../hooks/useBarcodeScanner";

interface ResultSectionProps {
  result: ScanResult;
}

export const ResultSection: React.FC<ResultSectionProps> = ({ result }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    setRenderError(null);

    if (!result.recreatedSvg) {
      setRenderError("Recreated code SVG not available from server.");
      return;
    }

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Unable to get 2D context from canvas.");
      }

      const img = new Image();
      const blob = new Blob([result.recreatedSvg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      img.onload = () => {
        // Clear canvas first
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Match canvas dimensions to the SVG natural size
        canvas.width = img.naturalWidth || 300;
        canvas.height = img.naturalHeight || 300;
        
        // Fill canvas with white background for scannability
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw the SVG image
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
      };

      img.onerror = () => {
        setRenderError("Failed to render recreated SVG image.");
        URL.revokeObjectURL(url);
      };

      img.src = url;
    } catch (err: any) {
      console.error("Barcode rendering error:", err);
      setRenderError(err.message || "Failed to render recreated barcode.");
    }
  }, [result.recreatedSvg]);

  const checkIsUrl = (text: string): boolean => {
    try {
      // Basic check for web links
      const parsed = new URL(text);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch (_) {
      // Fallback regex in case it's a URL without protocol (e.g. www.google.com)
      const pattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
      return pattern.test(text);
    }
  };

  const getFormatUrl = (text: string): string => {
    if (text.startsWith("http://") || text.startsWith("https://")) {
      return text;
    }
    return `https://${text}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const downloadPNG = () => {
    if (!result.recreatedSvg) return;
    try {
      const canvas = document.createElement("canvas");
      const img = new Image();
      const blob = new Blob([result.recreatedSvg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      img.onload = () => {
        const scaleFactor = 4; // Scale up 4x for high resolution
        canvas.width = (img.naturalWidth || 300) * scaleFactor;
        canvas.height = (img.naturalHeight || 300) * scaleFactor;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const pngUrl = canvas.toDataURL("image/png");
          const link = document.createElement("a");
          link.href = pngUrl;
          link.download = `recreated_${result.format.toLowerCase()}_code.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        URL.revokeObjectURL(url);
      };
      img.src = url;
    } catch (err) {
      console.error("Error downloading PNG:", err);
    }
  };

  const downloadSVG = () => {
    if (!result.recreatedSvg) return;
    try {
      const blob = new Blob([result.recreatedSvg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `recreated_${result.format.toLowerCase()}_code.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading SVG:", err);
    }
  };

  const isLink = checkIsUrl(result.content);

  return (
    <div className="result-section">
      <div className="result-header">
        <span className="form-label" style={{ marginBottom: 0 }}>
          Scanned Result
        </span>
        <span className="result-badge">{result.format}</span>
      </div>
      <div className="result-content" id="result-text">
        {result.content}
      </div>
      <div className="result-actions">
        <button
          onClick={handleCopy}
          className={`action-btn ${copied ? "btn-success" : "btn-secondary"}`}
          aria-label="Copy code contents to clipboard"
        >
          {copied ? (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copy to Clipboard
            </>
          )}
        </button>
        {isLink && (
          <a
            href={getFormatUrl(result.content)}
            target="_blank"
            rel="noopener noreferrer"
            className="action-btn btn-primary"
            style={{ textDecoration: "none" }}
            aria-label="Open URL in new tab"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Open Link
          </a>
        )}
      </div>

      <div className="recreated-section">
        <span className="form-label" style={{ marginBottom: "0.25rem", display: "block" }}>
          Recreated Code
        </span>
        
        {renderError ? (
          <div className="render-error">{renderError}</div>
        ) : (
          <div className="recreated-preview-container">
            <canvas ref={canvasRef} className="recreated-canvas" />
          </div>
        )}

        <div className="result-actions" style={{ marginTop: "0.5rem" }}>
          <button
            onClick={downloadPNG}
            className="action-btn btn-secondary"
            disabled={!result.recreatedSvg || !!renderError}
            aria-label="Download recreated code as PNG image"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download PNG
          </button>
          <button
            onClick={downloadSVG}
            className="action-btn btn-secondary"
            disabled={!result.recreatedSvg || !!renderError}
            aria-label="Download recreated code as vector SVG"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download SVG
          </button>
        </div>
      </div>
    </div>
  );
};
