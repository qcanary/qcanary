import { clerkMiddleware } from "@clerk/nextjs/server";

/**
 * Clerk auth middleware for Next.js
 * Uses clerkMiddleware() from Clerk v7.
 * Will be expanded in Session 12 with public/protected route config.
 */
export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
