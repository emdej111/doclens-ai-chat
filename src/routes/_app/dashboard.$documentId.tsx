import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { Eraser, SendHorizonal, Trash2, MessageSquare, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useDocuments } from "@/lib/documents-store";

export const Route = createFileRoute("/_app/dashboard/$documentId")({
  component: DocumentView,
});

function DocumentView() {
  const { documentId } = useParams({ from: "/_app/dashboard/$documentId" });
  const navigate = useNavigate();
  const { documents, loading, conversations, ask, remove, clearConversation } = useDocuments();
  const document = documents.find((doc) => doc.document_id === documentId);
  const messages = conversations[documentId] ?? [];
  const [question, setQuestion] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, thinking]);

  if (loading) {
    return <div className="text-muted-foreground p-8 text-sm">Loading document...</div>;
  }

  if (!document) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <h1 className="text-lg font-semibold">Document not found</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          It may have been deleted. Pick another document from the sidebar.
        </p>
      </div>
    );
  }

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || thinking) return;
    setQuestion("");
    setThinking(true);
    try {
      await ask(documentId, trimmed);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Couldn't get an answer. Please try again.",
      );
    } finally {
      setThinking(false);
    }
  };

  const onDelete = async () => {
    try {
      await remove(documentId);
      toast.success("Document deleted");
      navigate({ to: "/dashboard" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete the document.");
    }
  };

  return (
    <div className="flex h-full flex-col lg:h-[calc(100vh-3.5rem)] lg:flex-row">
      {/* Left panel */}
      <section className="border-border overflow-y-auto border-b p-6 lg:w-[35%] lg:border-r lg:border-b-0">
        <h1 className="text-lg font-semibold break-words">{document.filename}</h1>
        <p className="text-muted-foreground mt-1 text-xs">
          {document.num_pages} pages · {document.num_chunks} chunks
          {document.truncated_for_summary ? " · summary based on a truncated excerpt" : ""}
        </p>

        <h2 className="text-muted-foreground mt-8 text-xs font-medium tracking-wide uppercase">
          Summary
        </h2>
        <p className="mt-2 text-sm leading-relaxed whitespace-pre-line">{document.summary}</p>

        <div className="mt-8 flex flex-wrap gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                <Trash2 className="size-4" /> Delete Document
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this document?</AlertDialogTitle>
                <AlertDialogDescription>
                  {document.filename} and its conversation will be permanently removed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </section>

      {/* Right panel */}
      <section className="flex min-h-[60vh] flex-1 flex-col lg:w-[65%]">
        <header className="border-border flex items-center justify-between gap-3 border-b px-6 py-4">
          <h2 className="text-sm font-semibold">Ask about this document</h2>
          <Button
            variant="ghost"
            size="sm"
            disabled={messages.length === 0}
            onClick={() => clearConversation(documentId)}
          >
            <Eraser className="size-4" /> Clear conversation
          </Button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
          {messages.length === 0 && !thinking && (
            <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-3 text-center">
              <MessageSquare className="text-primary size-7" />
              <p className="max-w-xs text-sm">
                Ask anything about this document — summaries, obligations, numbers, dates. Answers
                cite the excerpts they were grounded in.
              </p>
            </div>
          )}

          {messages.map((message) =>
            message.role === "user" ? (
              <div key={message.id} className="flex justify-end">
                <p className="bg-primary text-primary-foreground max-w-[80%] rounded-2xl rounded-br-sm px-4 py-2.5 text-sm">
                  {message.content}
                </p>
              </div>
            ) : (
              <div key={message.id} className="flex justify-start">
                <div className="bg-card border-border max-w-[80%] rounded-2xl rounded-bl-sm border px-4 py-2.5 shadow-sm">
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  {message.sources && message.sources.length > 0 && (
                    <details className="mt-2">
                      <summary className="text-primary flex cursor-pointer list-none items-center gap-1 text-xs">
                        <ChevronDown className="size-3" />
                        Sources ({message.sources.length})
                      </summary>
                      <div className="mt-2 space-y-2">
                        {message.sources.map((source) => (
                          <div
                            key={source.chunk_index}
                            className="border-border bg-secondary/40 rounded-lg border p-2 text-xs"
                          >
                            <p className="text-muted-foreground mb-1">
                              Excerpt {source.chunk_index + 1} · relevance {source.score.toFixed(2)}
                            </p>
                            <p className="leading-relaxed">{source.text}</p>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              </div>
            ),
          )}

          {thinking && (
            <div className="flex justify-start">
              <div className="bg-card border-border flex items-center gap-1.5 rounded-2xl rounded-bl-sm border px-4 py-3.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="bg-primary typing-dot size-1.5 rounded-full"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form onSubmit={send} className="border-border flex gap-2 border-t px-6 py-4">
          <Input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask a question about this document..."
            aria-label="Ask a question about this document"
          />
          <Button type="submit" size="icon" disabled={!question.trim() || thinking}>
            <SendHorizonal className="size-4" />
          </Button>
        </form>
      </section>
    </div>
  );
}
