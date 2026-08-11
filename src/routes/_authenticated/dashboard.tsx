import { useState } from "react";
import { createFileRoute, Link, Outlet, useNavigate, useParams } from "@tanstack/react-router";
import { FileText, Plus, TriangleAlert, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadDialog } from "@/components/UploadDialog";
import { DocumentsProvider, useDocuments } from "@/lib/documents-store";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — DocLens" },
      {
        name: "description",
        content: "Your uploaded documents, AI summaries and document conversations in DocLens.",
      },
      { property: "og:title", content: "Dashboard — DocLens" },
      { property: "og:description", content: "Manage and analyse your uploaded PDFs." },
    ],
  }),
  component: () => (
    <DocumentsProvider>
      <DashboardLayout />
    </DocumentsProvider>
  ),
});

function DashboardLayout() {
  const { documents, demoMode, loading } = useDocuments();
  const navigate = useNavigate();
  const [uploadOpen, setUploadOpen] = useState(false);
  const params = useParams({ strict: false }) as { documentId?: string };

  return (
    <div className="flex min-h-screen flex-col">
      {demoMode && !loading && (
        <div className="bg-primary/15 text-primary flex items-center justify-center gap-2 px-4 py-2 text-center text-xs">
          <TriangleAlert className="size-3.5 shrink-0" />
          Running in demo mode — the backend is unreachable, so this is showing sample data.
        </div>
      )}
      {!demoMode && !loading && (
        <div className="bg-secondary/60 text-muted-foreground flex items-center justify-center gap-2 px-4 py-2 text-center text-xs">
          <Info className="size-3.5 shrink-0" />
          Demo app — documents are kept in memory only and are lost if the backend restarts.
        </div>
      )}

      <header className="border-border flex items-center justify-between gap-4 border-b px-4 py-3 sm:px-6">
        <Link to="/" className="text-base font-semibold tracking-tight">
          Doc<span className="text-primary">Lens</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setUploadOpen(true)}>
            <Plus className="size-4" /> Upload New Document
          </Button>
        </div>
      </header>

      <div className="flex flex-1 flex-col md:flex-row">
        <aside className="border-border bg-sidebar w-full shrink-0 border-b p-3 md:w-72 md:border-r md:border-b-0">
          <p className="text-muted-foreground px-2 pb-2 text-xs font-medium tracking-wide uppercase">
            Documents
          </p>
          {loading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="bg-secondary/50 h-16 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : documents.length === 0 ? (
            <p className="text-muted-foreground px-2 py-6 text-sm">
              No documents yet. Upload your first PDF to get started.
            </p>
          ) : (
            <ul className="space-y-1">
              {documents.map((doc) => {
                const active = params.documentId === doc.document_id;
                return (
                  <li key={doc.document_id}>
                    <Link
                      to="/dashboard/$documentId"
                      params={{ documentId: doc.document_id }}
                      className={`flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                        active ? "bg-primary/15 text-primary" : "hover:bg-secondary/60"
                      }`}
                    >
                      <FileText className="mt-0.5 size-4 shrink-0" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{doc.filename}</span>
                        <span className="text-muted-foreground block text-xs">
                          {doc.num_pages} pages
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>

      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUploaded={(documentId) => navigate({ to: "/dashboard/$documentId", params: { documentId } })}
      />
    </div>
  );
}
