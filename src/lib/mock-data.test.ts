import { describe, expect, it } from "vitest";
import { MOCK_DOCUMENTS, mockAnswer } from "./mock-data";

describe("MOCK_DOCUMENTS", () => {
  it("provides at least one sample document for demo mode", () => {
    expect(MOCK_DOCUMENTS.length).toBeGreaterThan(0);
  });

  it("every mock document has the fields the UI expects", () => {
    for (const doc of MOCK_DOCUMENTS) {
      expect(doc.document_id).toBeTruthy();
      expect(doc.filename).toBeTruthy();
      expect(doc.num_pages).toBeGreaterThan(0);
      expect(doc.summary.length).toBeGreaterThan(0);
    }
  });
});

describe("mockAnswer", () => {
  it("always returns a non-empty answer string", () => {
    const result = mockAnswer("What is this about?", 5);
    expect(result.answer.length).toBeGreaterThan(0);
  });

  it("returns at least one source excerpt", () => {
    const result = mockAnswer("Any question", 5);
    expect(result.sources.length).toBeGreaterThan(0);
  });

  it("never produces a chunk_index outside the document's chunk count", () => {
    const chunkCount = 3;
    const result = mockAnswer("A fairly long test question here", chunkCount);
    for (const source of result.sources) {
      expect(source.chunk_index).toBeGreaterThanOrEqual(0);
      expect(source.chunk_index).toBeLessThan(chunkCount);
    }
  });

  it("handles a document with only one chunk without crashing", () => {
    const result = mockAnswer("Question", 1);
    expect(result.sources.length).toBeGreaterThan(0);
    expect(result.sources[0]?.chunk_index).toBe(0);
  });
});
