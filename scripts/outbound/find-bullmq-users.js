#!/usr/bin/env node

/**
 * BullMQ User Discovery Script
 *
 * Finds packages that depend on BullMQ by querying the npm registry,
 * then cross-references with GitHub to find maintainer contact info.
 *
 * Usage:
 *   node scripts/outbound/find-bullmq-users.js [--limit 50] [--output tracking.csv]
 *
 * Output: CSV file with repo, maintainer, email, stars, last_commit
 *
 * Prerequisites: Requires a GitHub personal access token (gh CLI or GITHUB_TOKEN env var)
 */

const https = require('https');
const http = require('http');

const NPM_API = 'https://registry.npmjs.org';
const GITHUB_API = 'https://api.github.com';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

// Parse CLI args
const args = process.argv.slice(2);
const LIMIT = parseInt(args[args.indexOf('--limit') + 1], 10) || 50;
const OUTPUT = args[args.indexOf('--output') + 1] || 'tracking.csv';

// ── Helpers ───────────────────────────────────────────────

function fetchJson(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const opts = {
      headers: {
        'User-Agent': 'qcanary-outreach/1.0',
        Accept: 'application/json',
        ...headers,
      },
    };

    const req = proto.get(url, opts, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        // Handle non-JSON responses (HTML error pages, rate limit pages, etc.)
        const contentType = res.headers['content-type'] || '';
        if (!contentType.includes('json') && !contentType.includes('javascript')) {
          // Non-JSON response — likely an error page
          resolve({ status: res.statusCode, body: null, error: `Non-JSON response (${contentType || 'unknown'})` });
          return;
        }
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch (parseErr) {
          resolve({ status: res.statusCode, body: null, error: `JSON parse error: ${parseErr.message}` });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(15_000, () => {
      req.destroy();
      reject(new Error(`Request timed out: ${url}`));
    });
  });
}

async function searchNpm(query, size = 50) {
  const { body } = await fetchJson(
    `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(query)}&size=${size}`
  );
  return body?.objects?.map((o) => o.package) ?? [];
}

async function getPackageReadme(packageName) {
  const { body } = await fetchJson(`${NPM_API}/${packageName}/latest`);
  if (!body) return null;

  // Try to find the GitHub repo from package.json
  const repo = body.repository?.url || body.repository || '';
  const githubMatch = repo.match(/github\.com[:\/]([^/]+\/[^/.]+)/);
  const bugsUrl = body.bugs?.url || '';

  return {
    name: body.name,
    description: body.description || '',
    version: body.version,
    githubRepo: githubMatch ? githubMatch[1] : null,
    bugsUrl,
    author: body.author?.name || body.author?.email || body.author || 'Unknown',
    maintainers: (body.maintainers || []).map((m) => m.email || m.name || ''),
  };
}

async function getGitHubRepoInfo(repoFullName) {
  if (!GITHUB_TOKEN) return { stars: 0, description: '', pushedAt: null, ownerEmail: null };

  const { body } = await fetchJson(`${GITHUB_API}/repos/${repoFullName}`, {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
  });

  if (!body || body.message === 'Not Found') {
    return { stars: 0, description: '', pushedAt: null, ownerEmail: null };
  }

  return {
    stars: body.stargazers_count ?? 0,
    description: body.description ?? '',
    pushedAt: body.pushed_at ?? null,
    ownerLogin: body.owner?.login ?? null,
    ownerUrl: body.owner?.html_url ?? null,
  };
}

async function getGitHubUserEmail(username) {
  if (!GITHUB_TOKEN) return null;

  const { body } = await fetchJson(`${GITHUB_API}/users/${encodeURIComponent(username)}`, {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
  });

  return body?.email ?? null; // Often null unless user has public email
}

// ── Main ──────────────────────────────────────────────────

async function main() {
  console.log(`🔍 Searching npm for BullMQ-dependent packages (limit: ${LIMIT})...`);
  console.log(`ℹ️  ${GITHUB_TOKEN ? 'GitHub token found — will fetch stars/emails' : 'No GITHUB_TOKEN set — skipping GitHub metadata'}`);
  console.log('');

  // Search npm for BullMQ-related packages
  const queries = [
    'bullmq',
    '"Queue" "Scheduler" "bull"',
    'keywords:bullmq',
  ];

  const seen = new Set();
  const results = [];

  for (const query of queries) {
    const packages = await searchNpm(query, LIMIT);
    for (const pkg of packages) {
      if (seen.has(pkg.name)) continue;
      seen.add(pkg.name);

      // Only include packages that aren't bullmq itself
      if (pkg.name === 'bullmq') continue;

      const detail = await getPackageReadme(pkg.name);
      if (!detail) continue;

      let stars = 0;
      let ownerEmail = null;
      let pushedAt = null;

      if (detail.githubRepo) {
        const repoInfo = await getGitHubRepoInfo(detail.githubRepo);
        stars = repoInfo.stars;
        pushedAt = repoInfo.pushedAt;

        if (repoInfo.ownerLogin) {
          ownerEmail = await getGitHubUserEmail(repoInfo.ownerLogin);
        }
      }

      results.push({
        package: pkg.name,
        description: detail.description || pkg.description || '',
        githubRepo: detail.githubRepo || '',
        stars,
        lastPushed: pushedAt || 'unknown',
        author: detail.author || pkg.publisher?.username || 'unknown',
        email: ownerEmail || '',
        score: pkg.score?.detail?.popularity || 0,
      });

      // Be polite to the APIs
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  // Sort by GitHub stars descending (popular projects first)
  results.sort((a, b) => b.stars - a.stars);

  // Print results
  console.log(`\n📦 Found ${results.length} packages using BullMQ:\n`);
  console.log(
    'Package'.padEnd(30),
    'Stars'.padEnd(6),
    'Repo'.padEnd(30),
    'Email'.padEnd(30)
  );
  console.log('-'.repeat(96));

  for (const r of results.slice(0, LIMIT)) {
    console.log(
      r.package.padEnd(30),
      String(r.stars).padEnd(6),
      (r.githubRepo || '-').padEnd(30),
      (r.email || '-').padEnd(30)
    );
  }

  // Write CSV
  const fs = require('fs');
  const csvLines = [
    'date,package,description,github_repo,stars,last_pushed,author,email',
    ...results.slice(0, LIMIT).map((r) => {
      const today = new Date().toISOString().slice(0, 10);
      return [
        today,
        `"${r.package}"`,
        `"${(r.description || '').replace(/"/g, '""')}"`,
        r.githubRepo,
        r.stars,
        r.lastPushed,
        `"${r.author}"`,
        r.email,
      ].join(',');
    }),
  ];

  fs.writeFileSync(OUTPUT, csvLines.join('\n'), 'utf-8');
  console.log(`\n✅ Results written to ${OUTPUT}`);
  console.log(`\n🚀 Next steps:`);
  console.log(`   1. Open ${OUTPUT} in your spreadsheet app`);
  console.log(`   2. Filter repos with 5+ stars`);
  console.log(`   3. Visit each repo's GitHub page to find the maintainer's contact`);
  console.log(`   4. Send personalized DMs using the templates in README.md`);
  console.log(``);
  console.log(`💡 Tip: Add GITHUB_TOKEN to your env to auto-resolve public emails:`);
  console.log(`   export GITHUB_TOKEN=ghp_xxxxxxxxxxxx`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
