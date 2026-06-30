/**
 * Path segments that should never be treated as project IDs.
 * These match Clerk's built-in authentication routes.
 */
export const EXCLUDED_PROJECT_IDS = new Set(["sign-up", "sign-in"]);

/**
 * Determines whether a given path segment is a Clerk auth route
 * that should be excluded from project routing.
 */
export function isExcludedProjectId(segment: string): boolean {
  return EXCLUDED_PROJECT_IDS.has(segment);
}
