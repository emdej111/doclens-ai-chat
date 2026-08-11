import { createFileRoute, Outlet } from "@tanstack/react-router";

// This app has no login/auth — it's a single-user demo. This layout group
// (renders the shared dashboard shell) intentionally isn't named
// "_authenticated" to avoid implying an auth boundary that doesn't exist.
export const Route = createFileRoute("/_app")({
  ssr: false,
  component: () => <Outlet />,
});
