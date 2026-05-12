/**
 * build-og-images.tsx
 *
 * Generates static Open Graph PNGs (1200x630) for every docs page that has
 * frontmatter with both `title` and `slug` (or derives a slug from `id`).
 * Output: static/og/<slug-path>.png  (slashes in slug → hyphens in filename).
 *
 * Pipeline: JSX template (src/og/template.tsx) -> satori -> SVG -> sharp -> PNG.
 *
 * Walk strategy:
 *   1. Recursively find all .mdx and .md files under docs/.
 *   2. Parse YAML frontmatter to extract title, slug, description, id.
 *   3. Derive namespace from the parent directory name (e.g. docs/api/clipboard/
 *      → "clipboard").
 *   4. Render one PNG per page. Slug is used as the output filename (with
 *      leading slash stripped, internal slashes converted to hyphens).
 *   5. Inject `image: /og/<slug>.png` into each file's frontmatter (idempotent)
 *      so Docusaurus emits per-page <meta property="og:image"> automatically.
 *
 * Runs as `pnpm build:og`, hooked into `prebuild` so PNGs are always
 * up-to-date before Docusaurus copies static/ into build/.
 */

import { mkdir, readdir, readFile, stat, unlink, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
// biome-ignore lint/correctness/noUnusedImports: React must be in scope for JSX (satori uses React.createElement)
import React from 'react';
import satori from 'satori';
import sharp from 'sharp';
import { OgTemplate } from '../src/og/template';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DOCS_DIR = resolve(ROOT, 'docs');
const OUT_DIR = resolve(ROOT, 'static/og');
const FONTS_DIR = resolve(ROOT, 'src/og/fonts');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OgEntry {
  /** Output filename key — slug with leading slash stripped, slashes → hyphens */
  slug: string;
  /** Small label above the title — namespace name or "AITC Docs" */
  eyebrow: string;
  /** Main heading */
  title: string;
  /** One-line description */
  subtitle: string;
  /** Footer line */
  footer: string;
}

interface Frontmatter {
  title?: string;
  slug?: string;
  id?: string;
  description?: string;
}

// ---------------------------------------------------------------------------
// Frontmatter parser (no external deps — simple YAML line-by-line)
// ---------------------------------------------------------------------------

function parseFrontmatter(source: string): Frontmatter {
  const fm: Frontmatter = {};
  // Match the leading --- ... --- block
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return fm;
  const block = match[1];
  for (const line of block.split('\n')) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    // Strip inline quotes from value
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
// File walker
// ---------------------------------------------------------------------------

async function walkMdx(dir: string): Promise<string[]> {
  const results: string[] = [];
  const entries = await readdir(dir);
  for (const entry of entries) {
    const full = join(dir, entry);
    const s = await stat(full);
    if (s.isDirectory()) {
      results.push(...(await walkMdx(full)));
    } else if (entry.endsWith('.mdx') || entry.endsWith('.md')) {
      results.push(full);
    }
  }
  return results;
}

// ---------------------------------------------------------------------------
// Slug → filename key
// ---------------------------------------------------------------------------

/**
 * Convert a frontmatter slug like "/api/clipboard/setClipboardText" into a
 * filename-safe key like "api-clipboard-setClipboardText" (no leading slash,
 * slashes become hyphens). Root slug "/" maps to "intro".
 */
function slugToKey(slug: string): string {
  const stripped = slug.replace(/^\//, '').replace(/\//g, '-');
  return stripped === '' ? 'intro' : stripped;
}

/**
 * Derive a namespace name from the path of a file relative to docs/.
 * E.g. "api/clipboard/setClipboardText.mdx" → "clipboard".
 * For top-level files (intro.md, etc.) returns "Docs".
 */
function namespaceFromPath(filePath: string): string {
  const rel = relative(DOCS_DIR, filePath);
  // rel looks like "api/clipboard/setClipboardText.mdx"
  const parts = rel.split('/');
  if (parts.length >= 2) {
    // parts[0] = "api", parts[1] = "clipboard"
    return parts.length >= 3 ? (parts[1] ?? 'Docs') : (parts[0] ?? 'Docs');
  }
  return 'Docs';
}

// ---------------------------------------------------------------------------
// Entry builder
// ---------------------------------------------------------------------------

function buildEntry(filePath: string, fm: Frontmatter): OgEntry | null {
  if (!fm.title) return null;

  // Determine slug key — prefer explicit frontmatter slug, fallback to id-based
  let key: string;
  if (fm.slug) {
    key = slugToKey(fm.slug);
  } else if (fm.id) {
    // e.g. id "setClipboardText" in docs/api/clipboard/ → use relative path as key
    const rel = relative(DOCS_DIR, filePath)
      .replace(/\.(mdx?|md)$/, '')
      .replace(/\//g, '-');
    key = rel;
  } else {
    return null;
  }

  const namespace = namespaceFromPath(filePath);
  // Eyebrow: namespace in uppercase, or "AITC Docs" for root pages
  const eyebrow = namespace === 'Docs' ? 'AITC Docs' : namespace;

  const subtitle = truncate(
    plainText(fm.description ?? '커뮤니티가 정리한 앱인토스 미니앱 레퍼런스'),
    100,
  );

  return {
    slug: key,
    eyebrow,
    title: fm.title,
    subtitle,
    footer: 'docs.aitc.dev',
  };
}

// ---------------------------------------------------------------------------
// Text helpers
// ---------------------------------------------------------------------------

function plainText(md: string): string {
  return md
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen - 1).trimEnd()}…`;
}

// ---------------------------------------------------------------------------
// Font loader
// ---------------------------------------------------------------------------

async function loadFonts(): Promise<Parameters<typeof satori>[1]['fonts']> {
  const [bold, semibold, medium] = await Promise.all([
    readFile(resolve(FONTS_DIR, 'Pretendard-Bold.otf')),
    readFile(resolve(FONTS_DIR, 'Pretendard-SemiBold.otf')),
    readFile(resolve(FONTS_DIR, 'Pretendard-Medium.otf')),
  ]);
  return [
    { name: 'Pretendard', data: medium, weight: 500, style: 'normal' },
    { name: 'Pretendard', data: semibold, weight: 600, style: 'normal' },
    { name: 'Pretendard', data: bold, weight: 800, style: 'normal' },
  ];
}

// ---------------------------------------------------------------------------
// Renderer
// ---------------------------------------------------------------------------

async function renderEntry(
  entry: OgEntry,
  fonts: Awaited<ReturnType<typeof loadFonts>>,
): Promise<void> {
  const svg = await satori(
    <OgTemplate
      eyebrow={entry.eyebrow}
      title={entry.title}
      subtitle={entry.subtitle}
      footer={entry.footer}
    />,
    { width: 1200, height: 630, fonts },
  );
  const png = await sharp(Buffer.from(svg))
    .png({ compressionLevel: 9, palette: true, quality: 90 })
    .toBuffer();
  await writeFile(resolve(OUT_DIR, `${entry.slug}.png`), png);
}

// ---------------------------------------------------------------------------
// Frontmatter image injector
// ---------------------------------------------------------------------------

/**
 * Idempotently inject `image: /og/<slug>.png` into the frontmatter of a docs
 * file. Skips if the field is already present (any value). This lets Docusaurus
 * emit <meta property="og:image"> per page automatically.
 */
async function injectImageFrontmatter(filePath: string, slug: string): Promise<void> {
  const source = await readFile(filePath, 'utf8');
  // Already has an image field — don't touch it
  if (/^image:/m.test(source.slice(0, source.indexOf('---', 4)))) return;

  const ogPath = `/og/${slug}.png`;
  // Insert `image:` line right after the opening --- delimiter
  const updated = source.replace(/^---\r?\n/, `---\nimage: ${ogPath}\n`);
  if (updated !== source) {
    await writeFile(filePath, updated, 'utf8');
  }
}

// ---------------------------------------------------------------------------
// Stale pruner
// ---------------------------------------------------------------------------

async function pruneStale(validSlugs: Set<string>): Promise<void> {
  let existing: string[];
  try {
    existing = await readdir(OUT_DIR);
  } catch {
    return;
  }
  await Promise.all(
    existing
      .filter((f) => f.endsWith('.png'))
      .filter((f) => !validSlugs.has(f.replace(/\.png$/, '')))
      .map((f) => unlink(resolve(OUT_DIR, f))),
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  await mkdir(OUT_DIR, { recursive: true });
  const fonts = await loadFonts();

  const files = await walkMdx(DOCS_DIR);
  const fileEntries: Array<{ file: string; entry: OgEntry }> = [];

  for (const file of files.sort()) {
    const source = await readFile(file, 'utf8');
    const fm = parseFrontmatter(source);
    const entry = buildEntry(file, fm);
    if (entry) fileEntries.push({ file, entry });
  }

  console.log(`[og] generating ${fileEntries.length} images...`);
  const start = Date.now();

  for (const { file, entry } of fileEntries) {
    await renderEntry(entry, fonts);
    await injectImageFrontmatter(file, entry.slug);
    console.log(`[og]  -> ${entry.slug}.png`);
  }

  await pruneStale(new Set(fileEntries.map(({ entry }) => entry.slug)));
  console.log(`[og] done in ${Date.now() - start}ms`);
}

main().catch((err) => {
  console.error('[og] failed:', err);
  process.exit(1);
});
