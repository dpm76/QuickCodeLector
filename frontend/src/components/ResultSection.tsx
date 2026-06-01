import React, { useState } from "react";
import type { ScanResult } from "../hooks/useBarcodeScanner";

interface ResultSectionProps {
  result: ScanResult;
}

export const ResultSection: React.FC<ResultSectionProps> = ({ result }) => {
  const [copied, setCopied] = useState<boolean>(false);

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
    </div>
  );
};
