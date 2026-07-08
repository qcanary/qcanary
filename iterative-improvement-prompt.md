# QCanary Website — Iterative Improvement Prompt

Use this prompt to continue improving the qcanary.dev marketing website. Execute these phases in order, but skip any items already completed.

---

## Phase 1: Social Proof (High Priority)

1. **Replace placeholder testimonials with real ones** — The current testimonials use fake names ("Sarah Chen", "Marcus Rivera"). Replace them with quotes from actual users, or remove them until you have real ones. Each testimonial should have: real name, real company, real title, photo.

2. **Add GitHub stars counter** — Fetch live star count from GitHub API and display it in the stats section. Use a server component that fetches `GET https://api.github.com/repos/qcanary/qcanary` and displays `stargazers_count`.

3. **Add npm download counter** — Fetch live npm download count for `@qcanary/agent` from `https://api.npmjs.org/downloads/point/last-month/@qcanary/agent`.

4. **Add "Trusted By" company logo bar** — Create a row of company logos (even if just placeholder grayscale logos). Use the `public/screenshots/` pattern for serving images.

5. **Add case study section** — Create a "How [Company] uses QCanary" case study template. Link to it from the homepage.

---

## Phase 2: UI/UX Polish (Medium Priority)

1. **Add scroll-triggered animations** — Install `framer-motion` and add fade-in-up animations to sections as they enter the viewport. Keep animations subtle (opacity 0→1, translateY 10→0).

2. **Add a terminal typing animation to the hero code block** — Replace the blinking cursor `<span>` with a typewriter effect that types out each line sequentially. Use CSS `@keyframes` or a lightweight JS approach.

3. **Add architecture diagram micro-interactions** — Make the SVG architecture diagram interactive: hover on each box shows a tooltip with more detail. Use CSS hover states on SVG elements.

4. **Improve the dashboard preview** — Replace the static PNG screenshot with a video/GIF or an animated screenshot that cycles through different dashboard views. Or add a zoom-on-hover effect.

5. **Add a sticky mobile navigation** — The current nav is responsive but could have a mobile hamburger menu for screens < 768px.

6. **Add a "Back to top" button** — Floating button that appears after scrolling past the hero section.

7. **Improve blog content rendering** — The blog posts use `remark-html` with `sanitize: true` which strips all HTML from markdown content (including code blocks, tables, etc.). Either remove sanitization and add proper styling for `prose` classes, or use `rehype-sanitize` with a schema that allows code blocks and tables.

---

## Phase 3: SEO (Medium Priority)

1. **Add `Article` JSON-LD to blog posts** — Already done. Verify it renders correctly in view-source.

2. **Add FAQ schema JSON-LD** — The FAQ section on the homepage already has questions and answers. Add `FAQPage` structured data using `<Script>` tag so Google can show rich FAQ results.

3. **Add breadcrumb schema** — Add `BreadcrumbList` structured data to blog posts and docs pages.

4. **Improve image alt texts** — Audit all `<Image>` components for missing or generic alt text.

5. **Add `hreflang` tags** — If targeting multiple regions.

6. **Create individual OG images for each blog post** — Each blog post should have its own OpenGraph image with the post title overlaid on the QCanary brand background.

7. **Add `next-seo` or use Next.js metadata API** for per-page canonical URLs (already mostly done).

---

## Phase 4: Performance (Lower Priority)

1. **Check the `remark-html` with `sanitize: true` issue** — This strips HTML from markdown content. Check if existing blog posts lose formatting (code blocks, tables, etc.). If so, either remove sanitization (but be careful with XSS) or use `rehype-sanitize` with a permissive schema.

2. **Lazy-load below-fold images** — The dashboard screenshot is likely below the fold. Ensure it has `loading="lazy"` (Next.js `Image` does this by default).

3. **Check bundle size** — `lucide-react` is tree-shakeable, but verify `recharts` (used in the dashboard, not marketing page) isn't leaking into the marketing bundle.

4. **Add `preconnect` hints** — For external resources (Clerk, PostHog, Google Analytics), add `<link rel="preconnect">` in the root layout.

---

## Phase 5: Content & Conversion (Ongoing)

1. **Write more blog posts** — Target 1 post per week. Topics: "How to set up BullMQ alerting", "Comparing Bull job queues vs BullMQ", "Zero-trust monitoring for Redis", "BullMQ in serverless environments".

2. **Add a changelog page** — `marketing/changelog.md` parsed similar to blog posts. Shows product updates and builds trust.

3. **Add an "Integrations" page** — Document how to use QCanary with: Express, Fastify, NestJS, serverless (Lambda), Docker.

4. **Add a comparison page** — "QCanary vs Bull Board" comparison (content already exists as a blog post — link to it).

5. **Add email capture form** — Before the pricing section, add a simple email input for "Get notified about new features" (integrates with your existing Resend setup).

---

## Non-Goals (Don't Do)

- Do not put marketing content behind authentication
- Do not add third-party cookies or trackers beyond PostHog and Google Analytics
- Do not change the core messaging: "Monitor BullMQ without sharing Redis credentials"
- Do not add heavy animation frameworks (GSAP, Three.js) — keep it lightweight
- Do not change the existing dark theme color scheme (#0A0A0A bg, #22C55E accent)
