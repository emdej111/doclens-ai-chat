import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import {
  askQuestion,
  deleteDocument,
  listDocuments,
  pingBackend,
  uploadDocument,
  type ChatMessage,
  type DocumentRecord,
} from "@/lib/api";
import { MOCK_DOCUMENTS, mockAnswer } from "@/lib/mock-data";

type Store = {
  documents: DocumentRecord[];
  loading: boolean;
  demoMode: boolean;
  conversations: Record<string, ChatMessage[]>;
  upload: (file: File, onStage: (stage: string) => void) => Promise<DocumentRecord>;
  remove: (id: string) => Promise<void>;
  ask: (documentId: string, question: string) => Promise<void>;
  clearConversation: (documentId: string) => void;
};

const DocumentsContext = createContext<Store | null>(null);

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const uid = () => Math.random().toString(36).slice(2);

export function DocumentsProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<DocumentRecord[]>(MOCK_DOCUMENTS);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(true);
  const [conversations, setConversations] = useState<Record<string, ChatMessage[]>>({});

  useEffect(() => {
    let active = true;
    (async () => {
      const online = await pingBackend();
      if (!active) return;
      if (online) {
        try {
          const docs = await listDocuments();
          if (!active) return;
          setDocuments(docs);
          setDemoMode(false);
        } catch {
          setDemoMode(true);
        }
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const upload = useCallback<Store["upload"]>(
    async (file, onStage) => {
      onStage("Uploading...");
      if (!demoMode) {
        try {
          const doc = await uploadDocument(file);
          onStage("Ready");
          setDocuments((prev) => [doc, ...prev]);
          return doc;
        } catch (error) {
          setDemoMode(true);
          throw error;
        }
      }
      await wait(700);
      onStage("Extracting text...");
      await wait(900);
      onStage("Generating summary...");
      await wait(1100);
      const numPages = Math.max(3, Math.round(file.size / 45000));
      const doc: DocumentRecord = {
        document_id: uid(),
        filename: file.name,
        num_pages: numPages,
        num_chunks: Math.max(1, Math.round(numPages * 1.5)),
        summary:
          "This document was analysed in demo mode. The generated summary highlights the document's purpose, its main parties or subjects, and the structure of its sections. Connect the Python backend to get a real AI-generated summary produced from the extracted text.",
        truncated_for_summary: false,
      };
      onStage("Ready");
      setDocuments((prev) => [doc, ...prev]);
      return doc;
    },
    [demoMode],
  );

  const remove = useCallback<Store["remove"]>(
    async (id) => {
      if (!demoMode) {
        await deleteDocument(id);
      }
      setDocuments((prev) => prev.filter((doc) => doc.document_id !== id));
      setConversations((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    },
    [demoMode],
  );

  const ask = useCallback<Store["ask"]>(
    async (documentId, question) => {
      const userMessage: ChatMessage = { id: uid(), role: "user", content: question };
      setConversations((prev) => ({
        ...prev,
        [documentId]: [...(prev[documentId] ?? []), userMessage],
      }));

      const numChunks = documents.find((d) => d.document_id === documentId)?.num_chunks ?? 5;
      let reply: { answer: string; sources: NonNullable<ChatMessage["sources"]> };

      if (demoMode) {
        await wait(1200);
        reply = mockAnswer(question, numChunks);
      } else {
        reply = await askQuestion({ document_id: documentId, question });
      }

      const assistantMessage: ChatMessage = {
        id: uid(),
        role: "assistant",
        content: reply.answer,
        sources: reply.sources,
      };

      setConversations((prev) => ({
        ...prev,
        [documentId]: [...(prev[documentId] ?? []), assistantMessage],
      }));
    },
    [demoMode, documents],
  );

  const clearConversation = useCallback<Store["clearConversation"]>((documentId) => {
    setConversations((prev) => ({ ...prev, [documentId]: [] }));
  }, []);

  return (
    <DocumentsContext.Provider
      value={{
        documents,
        loading,
        demoMode,
        conversations,
        upload,
        remove,
        ask,
        clearConversation,
      }}
    >
      {children}
    </DocumentsContext.Provider>
  );
}

export function useDocuments() {
  const context = useContext(DocumentsContext);
  if (!context) throw new Error("useDocuments must be used inside DocumentsProvider");
  return context;
}
