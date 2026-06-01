import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ResultSection } from "../components/ResultSection";

describe("ResultSection Component", () => {
  const mockResultText = "Hello World Barcode";
  const mockResultUrl = "https://example.com";
  const mockSvg = '<svg width="10" height="10"><rect width="10" height="10" fill="black"/></svg>';
  
  beforeEach(() => {
    // Mock canvas getContext to avoid JSDOM "Not implemented" warnings
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      drawImage: vi.fn(),
    });

    // Mock navigator.clipboard
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
      writable: true,
      configurable: true,
    });
  });

  it("renders content and format badge correctly", () => {
    render(<ResultSection result={{ content: mockResultText, format: "QRCode", recreatedSvg: mockSvg }} />);
    
    expect(screen.getByText(mockResultText)).toBeInTheDocument();
    expect(screen.getByText("QRCode")).toBeInTheDocument();
  });

  it("does not render Open Link button if content is not a URL", () => {
    render(<ResultSection result={{ content: mockResultText, format: "Code128", recreatedSvg: mockSvg }} />);
    
    const openLinkBtn = screen.queryByRole("link", { name: /open url in new tab/i });
    expect(openLinkBtn).not.toBeInTheDocument();
  });

  it("renders Open Link button if content is a URL", () => {
    render(<ResultSection result={{ content: mockResultUrl, format: "QRCode", recreatedSvg: mockSvg }} />);
    
    const openLinkBtn = screen.getByRole("link", { name: /open url in new tab/i });
    expect(openLinkBtn).toBeInTheDocument();
    expect(openLinkBtn).toHaveAttribute("href", mockResultUrl);
    expect(openLinkBtn).toHaveAttribute("target", "_blank");
  });

  it("copies content to clipboard and shows success indicator when clicked", async () => {
    render(<ResultSection result={{ content: mockResultText, format: "Code128", recreatedSvg: mockSvg }} />);
    
    const copyBtn = screen.getByRole("button", { name: /copy code contents/i });
    expect(copyBtn).toHaveTextContent(/copy to clipboard/i);
    
    fireEvent.click(copyBtn);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockResultText);
    
    await waitFor(() => {
      expect(copyBtn).toHaveTextContent(/copied!/i);
    });
  });
});
