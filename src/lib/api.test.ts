import { describe, expect, it } from "vitest";
import { formatBytes, MAX_FILE_BYTES, validatePdf } from "./api";

function makeFile(name: string, sizeBytes: number, type = "application/pdf"): File {
  const blob = new Blob([new Uint8Array(sizeBytes)], { type });
  return new File([blob], name, { type });
}

describe("validatePdf", () => {
  it("accepts a valid PDF under the size limit", () => {
    const file = makeFile("document.pdf", 1024, "application/pdf");
    expect(validatePdf(file)).toBeNull();
  });

  it("rejects a non-PDF file by MIME type and extension", () => {
    const file = makeFile("notes.txt", 1024, "text/plain");
    expect(validatePdf(file)).toBe("Only PDF files are supported.");
  });

  it("accepts a file with .pdf extension even if the MIME type is generic", () => {
    // Some browsers/OSes report an empty or generic MIME type for PDFs.
    const file = makeFile("scan.pdf", 1024, "");
    expect(validatePdf(file)).toBeNull();
  });

  it("rejects a file larger than the 10MB limit", () => {
    const file = makeFile("big.pdf", MAX_FILE_BYTES + 1, "application/pdf");
    expect(validatePdf(file)).toBe("File exceeds the 10MB limit.");
  });

  it("accepts a file exactly at the size limit", () => {
    const file = makeFile("exact.pdf", MAX_FILE_BYTES, "application/pdf");
    expect(validatePdf(file)).toBeNull();
  });
});

describe("formatBytes", () => {
  it("returns an em dash for undefined or zero input", () => {
    expect(formatBytes(undefined)).toBe("—");
    expect(formatBytes(0)).toBe("—");
  });

  it("formats sizes under 1MB in KB", () => {
    expect(formatBytes(500 * 1024)).toBe("500 KB");
  });

  it("formats sizes at or above 1MB in MB with one decimal", () => {
    expect(formatBytes(1.5 * 1024 * 1024)).toBe("1.5 MB");
  });
});
