import { useState, useEffect, useRef } from "react";

export interface ScanResult {
  content: string;
  format: string;
}

export type InputMethod = "upload" | "camera";

export const useBarcodeScanner = () => {
  const [barcodeFormat, setBarcodeFormat] = useState<string>("AUTO");
  const [inputMethod, setInputMethod] = useState<InputMethod>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [maxFileSize, setMaxFileSize] = useState<number>(2 * 1024 * 1024); // Default to 2MB

  const streamRef = useRef<MediaStream | null>(null);
  const API_URL = "http://localhost:8000/api/decode";
  const SETTINGS_URL = "http://localhost:8000/api/settings";

  // Fetch settings on mount to dynamically get configuration limits
  useEffect(() => {
    fetch(SETTINGS_URL)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to load settings");
      })
      .then((data) => {
        if (data.max_file_size_bytes) {
          setMaxFileSize(data.max_file_size_bytes);
        }
      })
      .catch((err) => {
        console.warn("Using default settings. Server settings fetch failed:", err);
      });
  }, []);

  // Cleanup helper
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Start camera helper
  const startCamera = async () => {
    setError(null);
    setScanResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Prioritize back camera on phones
        audio: false,
      });
      streamRef.current = stream;
      setCameraActive(true);
      return stream;
    } catch (err: any) {
      console.error("Camera access failed", err);
      setError("Unable to access camera. Please check your permissions.");
      setCameraActive(false);
      return null;
    }
  };

  // Switch input method cleanup
  useEffect(() => {
    if (inputMethod !== "camera") {
      stopCamera();
    }
    // Reset state but keep the selected barcodeFormat
    setFile(null);
    setPreviewUrl(null);
    setScanResult(null);
    setError(null);

    return () => {
      stopCamera();
    };
  }, [inputMethod]);

  // Clean up URL object when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (selectedFile: File) => {
    setError(null);
    setScanResult(null);

    // Limit to images under configured limit
    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }
    if (selectedFile.size > maxFileSize) {
      const maxMb = maxFileSize / (1024 * 1024);
      const maxMbStr = maxMb % 1 === 0 ? maxMb.toFixed(0) : maxMb.toFixed(1);
      setError(`File is too large. Maximum size is ${maxMbStr}MB.`);
      return;
    }

    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
  };

  const clearFile = () => {
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setScanResult(null);
    setError(null);
  };

  const resetScanner = async () => {
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setScanResult(null);
    setError(null);
    
    if (inputMethod === "camera") {
      // Auto-restart camera when resetting in camera mode
      await startCamera();
    }
  };

  // Shared API call logic
  const sendToBackend = async (fileToDecode: File) => {
    const formData = new FormData();
    formData.append("file", fileToDecode);
    formData.append("format", barcodeFormat);

    const response = await fetch(API_URL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.success) {
      setScanResult({
        content: data.content,
        format: data.format,
      });
    } else {
      setError(data.message || "Failed to decode barcode.");
    }
  };

  const uploadAndDecode = async () => {
    if (!file) return;
    setIsScanning(true);
    setError(null);
    setScanResult(null);

    try {
      await sendToBackend(file);
    } catch (err: any) {
      setError(err.message || "An error occurred while connecting to the server.");
    } finally {
      setIsScanning(false);
    }
  };

  const captureAndDecode = async (videoElement: HTMLVideoElement | null) => {
    if (!videoElement || !cameraActive) {
      setError("Camera is not active.");
      return;
    }

    setIsScanning(true);
    setError(null);
    setScanResult(null);

    try {
      const canvas = document.createElement("canvas");
      // Set canvas size match current video size
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Unable to capture video context.");
      }

      // Draw current video frame to canvas
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      // Convert canvas to Blob
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/png");
      });

      if (!blob) {
        throw new Error("Failed to capture picture frame.");
      }

      const captureFile = new File([blob], "camera_capture.png", { type: "image/png" });
      
      // Save captured file and preview URL in state
      setFile(captureFile);
      const url = URL.createObjectURL(captureFile);
      setPreviewUrl(url);

      stopCamera(); // Stop camera tracks immediately after frame capture
      await sendToBackend(captureFile);
    } catch (err: any) {
      setError(err.message || "Failed to capture image from camera feed.");
    } finally {
      setIsScanning(false);
    }
  };

  return {
    barcodeFormat,
    setBarcodeFormat,
    inputMethod,
    setInputMethod,
    file,
    previewUrl,
    isScanning,
    scanResult,
    error,
    cameraActive,
    handleFileChange,
    clearFile,
    startCamera,
    stopCamera,
    uploadAndDecode,
    captureAndDecode,
    maxFileSize,
    resetScanner,
  };
};
