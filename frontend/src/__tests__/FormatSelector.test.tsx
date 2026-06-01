import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FormatSelector } from "../components/FormatSelector";

describe("FormatSelector Component", () => {
  it("renders with the correct selected format option", () => {
    render(<FormatSelector value="QR" onChange={() => {}} />);
    
    const select = screen.getByLabelText("Expected Format") as HTMLSelectElement;
    expect(select).toBeInTheDocument();
    expect(select.value).toBe("QR");
  });

  it("calls onChange handler when a different format is selected", () => {
    const handleChange = vi.fn();
    render(<FormatSelector value="AUTO" onChange={handleChange} />);
    
    const select = screen.getByLabelText("Expected Format");
    fireEvent.change(select, { target: { value: "DATAMATRIX" } });
    
    expect(handleChange).toHaveBeenCalledWith("DATAMATRIX");
  });

  it("is disabled when disabled prop is true", () => {
    render(<FormatSelector value="AUTO" onChange={() => {}} disabled={true} />);
    
    const select = screen.getByLabelText("Expected Format");
    expect(select).toBeDisabled();
  });
});
