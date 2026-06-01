import React from "react";

interface FormatSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const FormatSelector: React.FC<FormatSelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const formats = [
    { value: "AUTO", label: "✨ Auto-detect code type" },
    { value: "QR", label: "📱 QR Code (including Micro QR & rMQR)" },
    { value: "DATAMATRIX", label: "📦 Data Matrix" },
    { value: "AZTEC", label: "🎫 Aztec Code" },
    { value: "EAN", label: "🏷️ EAN / UPC (Retail barcodes)" },
    { value: "POSTCODE", label: "✉️ Postal Tracking (ITF, Code128, etc.)" },
  ];

  return (
    <div className="form-group">
      <label htmlFor="format-select" className="form-label">
        Expected Format
      </label>
      <div className="select-wrapper">
        <select
          id="format-select"
          className="select-control"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        >
          {formats.map((fmt) => (
            <option key={fmt.value} value={fmt.value}>
              {fmt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
