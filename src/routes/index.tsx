import { createFileRoute, Link } from "@tanstack/react-router";
import { FileUp, Bot, MessagesSquare, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DocLens — Upload a document. Ask anything." },
      {
        name: "description",
        content:
          "DocLens is an AI document analyzer. Upload a PDF, get an instant summary, then ask questions and get answers grounded in cited excerpts from the document.",
      },
      { property: "og:title", content: "DocLens — Upload a document. Ask anything." },
      {
        property: "og:description",
        content: "Upload a PDF and chat with it. AI summaries and source-grounded answers.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: FileUp,
    emoji: "📄",
    title: "Upload any PDF",
    body: "Drag and drop contracts, reports or research papers up to 10MB. Text is extracted page by page.",
  },
  {
    icon: Bot,
    emoji: "🤖",
    title: "AI-powered summary",
    body: "Get a concise, AI-generated summary the moment analysis finishes — no skimming required.",
  },
  {
    icon: MessagesSquare,
    emoji: "💬",
    title: "Ask questions",
    body: "Chat with your document. Every answer links back to the exact excerpts it was grounded in, so you can verify it.",
  },
];

function Landing() {
  return (
    <main className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="text-lg font-semibold tracking-tight">
          Doc<span className="text-primary">Lens</span>
        </span>
        <Button asChild variant="ghost" size="sm">
          <Link to="/dashboard">Open app</Link>
        </Button>
      </header>

      <section className="gradient-hero relative overflow-hidden">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center sm:py-32">
          <span className="border-border bg-secondary/50 text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs">
            <Sparkles className="text-primary size-3.5" />
            Powered by Claude AI and RAG
          </span>
          <h1 className="text-gradient mt-6 text-5xl font-bold tracking-tight sm:text-6xl">
            DocLens
          </h1>
          <p className="text-muted-foreground mt-4 text-xl">Upload a document. Ask anything.</p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/dashboard">
                Get Started <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#features">See how it works</a>
            </Button>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl scroll-mt-16 px-6 py-20">
        <h2 className="text-center text-2xl font-semibold tracking-tight">How it works</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="border-border bg-card hover:border-primary/50 rounded-2xl border p-6 transition-colors"
            >
              <div className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-xl">
                <feature.icon className="size-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold">
                <span aria-hidden className="mr-2">
                  {feature.emoji}
                </span>
                {feature.title}
              </h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-border text-muted-foreground border-t px-6 py-8 text-center text-sm">
        DocLens — read less, understand more.
      </footer>
    </main>
  );
}

