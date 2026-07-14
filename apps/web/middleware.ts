import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/docs(.*)",
  "/blog(.*)",
  "/billing(.*)",
  "/compare(.*)",    "/features(.*)",
    "/feedback",
    "/trust(.*)",
    "/testimonial",
    "/about(.*)",    "/contact(.*)",
    "/pricing",
    "/ph",
    "/opengraph-image",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/v1/ingest(.*)",
  "/api/v1/health",
  "/health",
]);

export default clerkMiddleware(async (auth, req) => {
  // All routes are protected by default except those explicitly listed as public.
  // This ensures dashboard routes like /[projectId], /[projectId]/queues, etc.
  // are always behind auth, even if they aren't explicitly listed.
  // Non-existent routes will hit the sign-in page first (Clerk redirect),
  // then redirect to Next.js's not-found.tsx after authentication.
  if (isPublicRoute(req)) {
    return;
  }

  await auth.protect();
  return;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|txt|xml)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
