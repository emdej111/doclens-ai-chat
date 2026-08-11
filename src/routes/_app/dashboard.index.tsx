import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadDialog } from "@/components/UploadDialog";

export const Route = createFileRoute("/_app/dashboard/")({
  component: DashboardEmpty,
});

function DashboardEmpty() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-16 text-center">
      <div className="bg-primary/10 text-primary flex size-16 items-center justify-center rounded-2xl">
        <UploadCloud className="size-7" />
      </div>
      <h1 className="mt-6 text-xl font-semibold tracking-tight">No document selected</h1>
      <p className="text-muted-foreground mt-2 max-w-sm text-sm">
        Pick a document from the sidebar, or upload a new PDF and DocLens will summarise it and
        answer your questions.
      </p>
      <Button className="mt-6" onClick={() => setOpen(true)}>
        Upload a document
      </Button>

      <UploadDialog
        open={open}
        onOpenChange={setOpen}
        onUploaded={(documentId) =>
          navigate({ to: "/dashboard/$documentId", params: { documentId } })
        }
      />
    </div>
  );
}
