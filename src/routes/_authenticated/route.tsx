import { createFileRoute, Outlet } from "@tanstack/react-router";

// This app has no login/auth — it's a single-user demo. The route segment
// name "_authenticated" is kept only because renaming it would require
// regenerating every route path in this file-based router.
export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: () => <Outlet />,
});
