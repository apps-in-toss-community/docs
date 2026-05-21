// ---------------------------------------------------------------------------
// Shared frontmatter parser — used by build-og-images.tsx and build-llms-txt.ts
// (no external deps — simple YAML line-by-line for the leading --- ... --- block)
// ---------------------------------------------------------------------------

export interface Frontmatter {
  title?: string;
  slug?: string;
  id?: string;
  description?: string;
}

export function parseFrontmatter(source: string): Frontmatter {
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
