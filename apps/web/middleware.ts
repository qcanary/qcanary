import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/docs(.*)",
  "/blog(.*)",
  "/billing(.*)",
  "/compare(.*)",
  "/features(.*)",
  "/about(.*)",
  "/contact(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/v1/ingest(.*)",
  "/api/v1/health",
  "/health",
]);

const isDashboardRoute = createRouteMatcher([
  "/settings(.*)",
  "/onboarding(.*)",
  "/alerts(.*)",
  "/queues(.*)",
  "/projects(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Let public routes and all non-dashboard routes pass through freely.
  // Non-existent routes will hit Next.js's not-found.tsx 404 handler.
  if (isPublicRoute(req)) {
    return;
  }

  // Only protect actual dashboard routes — unknown/404 routes stay public
  if (isDashboardRoute(req)) {
    await auth.protect();
    return;
  }

  // All other routes (including non-existent ones) are public —
  // let Next.js handle 404s via not-found.tsx
  return;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
