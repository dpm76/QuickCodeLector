

import React, { useRef, useEffect, useState } from "react";
import type { InputMethod } from "../hooks/useBarcodeScanner";

interface ImageScannerProps {
  inputMethod: InputMethod;
  setInputMethod: (method: InputMethod) => void;
  previewUrl: string | null;
  file: File | null;
  cameraActive: boolean;
  isScanning: boolean;
  handleFileChange: (file: File) => void;
  clearFile: () => void;
  startCamera: () => Promise<MediaStream | null>;
  stopCamera: () => void;
  uploadAndDecode: () => void;
  captureAndDecode: (video: HTMLVideoElement | null) => void;
  maxFileSize: number;
}

export const ImageScanner: React.FC<ImageScannerProps> = ({
  inputMethod,
  setInputMethod,
  previewUrl,
  file,
  cameraActive,
  isScanning,
  handleFileChange,
  clearFile,
  startCamera,
  stopCamera,
  uploadAndDecode,
  captureAndDecode,
  maxFileSize,
}) => {
  const [dragging, setDragging] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Setup camera stream when camera tab is open or reset
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    if (inputMethod === "camera" && !previewUrl) {
      startCamera().then((stream) => {
        if (stream && videoRef.current) {
          videoRef.current.srcObject = stream;
          activeStream = stream;
        }
      });
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
      stopCamera();
    };
  }, [inputMethod, previewUrl]);

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const onFileSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileChange(e.target.files[0]);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileSelectChange}
        accept="image/*"
        style={{ display: "none" }}
      />
      {/* Input Method Selector Tab */}
      <div className="input-tabs">
        <button
          className={`tab-btn ${inputMethod === "upload" ? "active" : ""}`}
          onClick={() => {
            setInputMethod("upload");
            triggerFileSelect();
          }}
          aria-label="Upload an image file"
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
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Upload Image
        </button>
        <button
          className={`tab-btn ${inputMethod === "camera" ? "active" : ""}`}
          onClick={() => setInputMethod("camera")}
          aria-label="Use device camera"
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
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          Use Camera
        </button>
      </div>

      {/* File Upload View */}
      {inputMethod === "upload" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {!previewUrl ? (
            <div
              className={`upload-zone ${dragging ? "dragging" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
              role="button"
              tabIndex={0}
              aria-label="Drag and drop or click to upload barcode image"
            >

              <div className="upload-icon">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
              <p className="upload-text">Drag & drop your barcode image here</p>
              <p className="upload-hint">
                or click to browse from device (Max {maxFileSize / (1024 * 1024)}MB)
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="preview-container">
                <img
                  src={previewUrl}
                  alt="Barcode upload preview"
                  className="preview-image"
                />
                <div className="preview-overlay">
                  <button
                    onClick={clearFile}
                    className="clear-btn"
                    disabled={isScanning}
                    aria-label="Remove uploaded image"
                  >
                    Clear Image
                  </button>
                </div>
              </div>
              <button
                className="action-btn btn-primary"
                style={{ alignSelf: "center" }}
                onClick={uploadAndDecode}
                disabled={isScanning || !file}
                aria-label="Scan uploaded image"
              >
                {isScanning ? (
                  <>
                    <div className="spinner" />
                    Scanning...
                  </>
                ) : (
                  <>
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
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    Scan Image
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Live Camera View */}
      {inputMethod === "camera" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {previewUrl ? (
            <div className="preview-container">
              <img
                src={previewUrl}
                alt="Captured code preview"
                className="preview-image"
              />
            </div>
          ) : (
            <div className="camera-container">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="camera-video"
                style={{ display: cameraActive ? "block" : "none" }}
              />
              {!cameraActive && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center", padding: "2rem", width: "100%" }}>
                  <p style={{ color: "var(--text-secondary)", textAlign: "center" }}>
                    Camera is inactive.
                  </p>
                  <button
                    className="action-btn btn-primary"
                    onClick={() => {
                      startCamera().then((stream) => {
                        if (stream && videoRef.current) {
                          videoRef.current.srcObject = stream;
                        }
                      });
                    }}
                    aria-label="Start camera stream"
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
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                    Start Camera
                  </button>
                </div>
              )}
              {cameraActive && (
                <div className="camera-overlay">
                  <div className="scanner-target" />
                </div>
              )}
            </div>
          )}
          {cameraActive && !previewUrl && (
            <div className="camera-controls">
              <button
                className="action-btn btn-primary"
                onClick={() => captureAndDecode(videoRef.current)}
                disabled={isScanning}
                aria-label="Capture and scan video frame"
              >
                {isScanning ? (
                  <>
                    <div className="spinner" />
                    Analyzing...
                  </>
                ) : (
                  <>
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
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    Capture & Scan
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
