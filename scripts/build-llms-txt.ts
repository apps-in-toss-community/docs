#!/usr/bin/env -S node --no-warnings
/**
 * build-llms-txt.ts
 *
 * Generates static/llms.txt following the llmstxt.org spec:
 *   https://llmstxt.org
 *
 * Structure emitted:
 *   - H1 site title + one-paragraph description
 *   - ## Overview pages  — 18 namespace overview URLs (ko + en), one line each
 *   - ## API reference   — all method pages grouped by namespace, with URL + description
 *
 * Walk strategy:
 *   1. Walk docs/api/<namespace>/index.mdx → overview pages
 *   2. Walk docs/api/<namespace>/<method>.mdx → method pages, group by namespace
 *   3. For each page: derive canonical URL from frontmatter (slug preferred, id fallback)
 *   4. Emit to static/llms.txt
 *
 * Runs as `pnpm build:llms`, hooked into `prebuild` alongside build:og.
 */

import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DOCS_API_DIR = resolve(ROOT, 'docs', 'api');
const OUT_PATH = resolve(ROOT, 'static', 'llms.txt');

const BASE_URL = 'https://docs.aitc.dev';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Frontmatter {
  title?: string;
  slug?: string;
  id?: string;
  description?: string;
}

interface PageEntry {
  namespace: string;
  /** Canonical ko URL, e.g. https://docs.aitc.dev/api/clipboard/setClipboardText */
  url: string;
  title: string;
  description: string;
  isOverview: boolean;
}

// ---------------------------------------------------------------------------
// Frontmatter parser — reuses same logic as build-og-images.tsx
// ---------------------------------------------------------------------------

function parseFrontmatter(source: string): Frontmatter {
  const fm: Frontmatter = {};
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return fm;
  const block = match[1];
  for (const line of block.split('\n')) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    const raw = line.slice(colon + 1).trim();
    const value = raw.replace(/^['"]|['"]$/g, '');
    if (key === 'title') fm.title = value;
    else if (key === 'slug') fm.slug = value;
    else if (key === 'id') fm.id = value;
    else if (key === 'description') fm.description = value;
  }
  return fm;
}

// ---------------------------------------------------------------------------
// URL deriver
// ---------------------------------------------------------------------------

/**
 * Derive a canonical ko URL from frontmatter + file path.
 * Priority: explicit `slug` frontmatter → path-based derivation from `id`.
 */
function deriveUrl(filePath: string, fm: Frontmatter, isOverview: boolean): string | null {
  if (fm.slug) {
    // slug is already absolute path, e.g. "/api/clipboard"
    return `${BASE_URL}${fm.slug}`;
  }

  if (fm.id) {
    // Derive from file structure: docs/api/<namespace>/<method>.mdx
    const rel = relative(DOCS_API_DIR, filePath);
    // rel = "clipboard/setClipboardText.mdx" or "clipboard/index.mdx"
    const parts = rel.replace(/\.(mdx?)$/, '').split('/');
    if (isOverview) {
      // index → /api/<namespace>
      return `${BASE_URL}/api/${parts[0]}`;
    }
    // method → /api/<namespace>/<method>
    return `${BASE_URL}/api/${parts[0]}/${parts[1]}`;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Walker
// ---------------------------------------------------------------------------

async function walkApiDir(): Promise<PageEntry[]> {
  const namespaceDirs = await readdir(DOCS_API_DIR);
  const pages: PageEntry[] = [];

  for (const ns of namespaceDirs.sort()) {
    const nsPath = join(DOCS_API_DIR, ns);
    const s = await stat(nsPath);
    if (!s.isDirectory()) continue;

    const files = (await readdir(nsPath))
      .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
      .sort();

    for (const file of files) {
      const filePath = join(nsPath, file);
      const isOverview = file === 'index.mdx' || file === 'index.md';
      const source = await readFile(filePath, 'utf8');
      const fm = parseFrontmatter(source);

      if (!fm.title) continue;

      const url = deriveUrl(filePath, fm, isOverview);
      if (!url) continue;

      const description = fm.description ?? '';

      pages.push({
        namespace: ns,
        url,
        title: fm.title,
        description,
        isOverview,
      });
    }
  }

  return pages;
}

// ---------------------------------------------------------------------------
// llms.txt emitter
// ---------------------------------------------------------------------------

function buildLlmsTxt(pages: PageEntry[]): string {
  const lines: string[] = [];

  // H1 + description block (llmstxt.org spec: first section is site description)
  lines.push('# Apps In Toss Community — SDK Docs');
  lines.push('');
  lines.push('커뮤니티가 재구성한 `@apps-in-toss/web-framework` 미니앱 SDK 가이드·레퍼런스.');
  lines.push(
    'Community-maintained guide and API reference for the `@apps-in-toss/web-framework` mini-app SDK.',
  );
  lines.push('');
  lines.push(`> Source: ${BASE_URL}`);
  lines.push('');

  // --- Overview pages ---
  const overviews = pages.filter((p) => p.isOverview);
  lines.push('## Overview pages');
  lines.push('');
  for (const p of overviews) {
    const desc = p.description ? `: ${p.description}` : '';
    lines.push(`- [${p.title}](${p.url})${desc}`);
    // en mirror URL
    const enUrl = p.url.replace(BASE_URL, `${BASE_URL}/en`);
    lines.push(`- [${p.title} (en)](${enUrl})${desc}`);
  }
  lines.push('');

  // --- API reference grouped by namespace ---
  const methodPages = pages.filter((p) => !p.isOverview);
  const byNamespace = new Map<string, PageEntry[]>();
  for (const p of methodPages) {
    const list = byNamespace.get(p.namespace) ?? [];
    list.push(p);
    byNamespace.set(p.namespace, list);
  }

  lines.push('## API reference');
  lines.push('');
  for (const [ns, methods] of [...byNamespace.entries()].sort()) {
    lines.push(`### ${ns}`);
    lines.push('');
    for (const m of methods) {
      const desc = m.description ? ` — ${m.description}` : '';
      lines.push(`- [${m.title}](${m.url})${desc}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const pages = await walkApiDir();
  const overviewCount = pages.filter((p) => p.isOverview).length;
  const methodCount = pages.filter((p) => !p.isOverview).length;

  console.log(`[llms] ${overviewCount} namespace overviews, ${methodCount} method pages`);

  const content = buildLlmsTxt(pages);
  await writeFile(OUT_PATH, content, 'utf8');

  console.log(`[llms] wrote static/llms.txt (${content.length} bytes)`);
}

main().catch((err) => {
  console.error('[llms] failed:', err);
  process.exit(1);
});
