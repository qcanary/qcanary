# Qcanary: 10-Hour Iterative Improvement Run

## Process
Work through items in priority order. After every 2-3 fixes:
1. Typecheck API (`npx tsc --noEmit -p apps/api/tsconfig.json`)
2. Typecheck Web (`npx tsc --noEmit --skipLibCheck -p apps/web/tsconfig.json`)
3. Spawn code-reviewer-deepseek-flash
4. Fix any issues found
5. Repeat

## Priority Order

### Batch 1: 404 Page + Social Proof (P0-P1)
1. Fix 404 page — ensure not-found.tsx works without being caught by Clerk middleware
2. Add GitHub stars badge widget to landing page
3. Add real social proof metrics to community section

### Batch 2: Onboarding Polish (P1)
4. Add auto-select API key on creation
5. Add auto-redirect after test events sent
6. Add help tooltip icons to project name/environment fields

### Batch 3: PostHog Tracking + Empty States (P1-P2)
7. Add PostHog conversion funnel events
8. Add dashboard empty states for no-queues, no-alerts
9. Add Retry-After headers to rate limit responses

### Batch 4: Mobile Responsiveness (P2)
10. Make sidebar collapsible on mobile
11. Make tables horizontally scrollable
12. Test and fix at 375px width

### Batch 5: Extra Health Items
13. Add Dodo environment safety comments/docs cleanup
14. Fix any remaining catch block typing issues
15. Verify the proxy route sanitization is complete
