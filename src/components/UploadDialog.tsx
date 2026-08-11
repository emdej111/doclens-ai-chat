import { useCallback, useRef, useState } from "react";
import { FileText, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatBytes, validatePdf } from "@/lib/api";
import { useDocuments } from "@/lib/documents-store";

export function UploadDialog({
  open,
  onOpenChange,
  onUploaded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploaded: (documentId: string) => void;
}) {
  const { upload } = useDocuments();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [stage, setStage] = useState<string | null>(null);

  const select = useCallback((next: File | undefined) => {
    if (!next) return;
    const error = validatePdf(next);
    if (error) {
      toast.error(error);
      return;
    }
    setFile(next);
  }, []);

  const reset = () => {
    setFile(null);
    setStage(null);
  };

  const analyse = async () => {
    if (!file) return;
    try {
      const doc = await upload(file, setStage);
      toast.success("Document analysed");
      reset();
      onOpenChange(false);
      onUploaded(doc.document_id);
    } catch (error) {
      setStage(null);
      toast.error(error instanceof Error ? error.message : "Upload failed. Please try again.");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (stage) return;
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="bg-card sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload a document</DialogTitle>
          <DialogDescription>PDF only, up to 10MB.</DialogDescription>
        </DialogHeader>

        {!file ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              select(e.dataTransfer.files?.[0]);
            }}
            className={`flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed p-10 transition-colors ${
              dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/60"
            }`}
          >
            <UploadCloud className="text-primary size-8" />
            <span className="text-sm font-medium">Drag & drop your PDF here</span>
            <span className="text-muted-foreground text-xs">or click to browse your files</span>
          </button>
        ) : (
          <div className="border-border bg-secondary/40 flex items-center gap-3 rounded-xl border p-4">
            <FileText className="text-primary size-6 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="text-muted-foreground text-xs">{formatBytes(file.size)}</p>
            </div>
            {!stage && (
              <Button variant="ghost" size="icon" onClick={reset} aria-label="Remove file">
                <X className="size-4" />
              </Button>
            )}
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => select(e.target.files?.[0])}
        />

        {stage && (
          <p className="text-primary flex items-center gap-2 text-sm">
            <span className="border-primary size-3 animate-spin rounded-full border-2 border-t-transparent" />
            {stage}
          </p>
        )}

        <Button className="w-full" disabled={!file || !!stage} onClick={analyse}>
          {stage ? "Working..." : "Analyse Document"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
