export const API_BASE = "https://web-copy-production-e12e.up.railway.app";

export type SourceChunk = {
  chunk_index: number;
  score: number;
  text: string;
};

export type DocumentRecord = {
  document_id: string;
  filename: string;
  num_pages: number;
  num_chunks: number;
  summary: string;
  truncated_for_summary?: boolean;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: SourceChunk[];
};

export class BackendUnreachableError extends Error {
  constructor() {
    super("Backend is not running. Please start the Python server.");
    this.name = "BackendUnreachableError";
  }
}

async function request<T>(path: string, init?: RequestInit, timeoutMs = 30000): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch {
    throw new BackendUnreachableError();
  }
  if (!response.ok) {
    let detail = "";
    try {
      const body = await response.json();
      detail = body?.detail ?? "";
    } catch {
      // ignore, body wasn't JSON
    }
    throw new Error(detail || `Request failed (${response.status})`);
  }
  return (await response.json()) as T;
}

export async function pingBackend(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/api/health`, { signal: AbortSignal.timeout(15000) });
    return response.ok;
  } catch {
    return false;
  }
}

export function listDocuments() {
  return request<DocumentRecord[]>("/api/documents");
}

export function uploadDocument(file: File) {
  const body = new FormData();
  body.append("file", file);
  return request<DocumentRecord>("/api/upload", { method: "POST", body }, 90000);
}

export function askQuestion(payload: {
  document_id: string;
  question: string;
  top_k?: number | null;
}) {
  return request<{ answer: string; sources: SourceChunk[] }>(
    "/api/ask",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    90000,
  );
}

export function deleteDocument(id: string) {
  return request<{ status: string }>(`/api/documents/${id}`, { method: "DELETE" });
}

export const MAX_FILE_BYTES = 10 * 1024 * 1024;

export function validatePdf(file: File): string | null {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return "Only PDF files are supported.";
  }
  if (file.size > MAX_FILE_BYTES) {
    return "File exceeds the 10MB limit.";
  }
  return null;
}

export function formatBytes(bytes?: number) {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

