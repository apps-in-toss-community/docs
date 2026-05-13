#!/usr/bin/env -S node --no-warnings
/**
 * verify-crosslinks
 *
 * Verifies that namespace/method names under `docs/api/<group>/<method>.mdx` line
 * up 1:1 with the ApiCard `name="..."` props in the sdk-example repo. The two
 * repos are independent, but `TryItLink` deep-links from docs into sdk-example
 * by slug + anchor — if either side renames a method without the other, the
 * link silently rots. This script catches that drift in CI.
 *
 * Strategy (B in the task brief): fetch the sdk-example page sources from GitHub
 * raw and parse `name="..."` props statically. Strategy A (live HTML scrape) is
 * impractical because sdk-example is a Vite SPA — deep paths return 404 and the
 * ApiCard list is rendered client-side.
 *
 * External fetch failure (GitHub down, rate limit) → exit 0 with a warning. CI
 * should not break on third-party outages; the trade-off is that drift goes
 * unverified for that one run. Use `--strict` to fail closed instead.
 *
 * Exit codes:
 *   0 — all docs methods exist in sdk-example (and, with --strict, vice versa)
 *   1 — drift detected
 *   2 — fetch/parse error (only with --strict; otherwise warns and exits 0)
 *
 * Flags:
 *   --strict       sdk-example methods missing from docs are errors (default: info)
 *                  + fetch failures are errors instead of warnings
 *   --ref <ref>    git ref to read sdk-example from (default: main)
 *   --json         machine-readable summary on stdout (in addition to console output)
 */

import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

interface Args {
  strict: boolean;
  ref: string;
  json: boolean;
}

interface NamespaceReport {
  group: string;
  docsMethods: string[];
  sdkMethods: string[] | null; // null when fetch failed
  missingInSdk: string[];
  missingInDocs: string[];
  fetchError?: string;
}

const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url));
const DOCS_API_DIRS = [
  join(REPO_ROOT, 'docs', 'api'),
  join(REPO_ROOT, 'i18n', 'en', 'docusaurus-plugin-content-docs', 'current', 'api'),
];
const SDK_EXAMPLE_REPO = 'apps-in-toss-community/sdk-example';
const SDK_EXAMPLE_PAGES_DIR = 'src/pages';

// `<group>` (lowercase docs slug) → `<File>.tsx` filename in sdk-example.
// Default rule: capitalize first letter + "Page.tsx". Overrides for groups
// where the file casing diverges (e.g., acronyms).
const SDK_PAGE_FILENAME_OVERRIDES: Record<string, string> = {
  iap: 'IAPPage.tsx',
};

function defaultSdkPageFilename(group: string): string {
  return `${group.charAt(0).toUpperCase()}${group.slice(1)}Page.tsx`;
}

function sdkPageFilename(group: string): string {
  return (
    SDK_EXAMPLE_PAGES_DIR +
    '/' +
    (SDK_PAGE_FILENAME_OVERRIDES[group] ?? defaultSdkPageFilename(group))
  );
}

function parseArgs(argv: string[]): Args {
  const args: Args = { strict: false, ref: 'main', json: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--strict') args.strict = true;
    else if (a === '--json') args.json = true;
    else if (a === '--ref') {
      const next = argv[++i];
      if (!next) throw new Error('--ref requires a value');
      args.ref = next;
    } else {
      throw new Error(`Unknown argument: ${a}`);
    }
  }
  return args;
}

function isDir(p: string): boolean {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
}

/**
 * Scan one or more docs trees and build a per-namespace method set.
 * A "method" is any `<file>.mdx` directly under `<api>/<group>/` other
 * than `index.mdx`. Empty namespaces (only an index) are still tracked.
 *
 * If a namespace appears in both ko and en trees with different method
 * sets, we union them — both should describe the same SDK surface; the
 * union is the right thing to verify against sdk-example.
 */
function scanDocsNamespaces(): Map<string, Set<string>> {
  const groups = new Map<string, Set<string>>();
  for (const root of DOCS_API_DIRS) {
    if (!isDir(root)) continue;
    for (const groupName of readdirSync(root)) {
      const groupDir = join(root, groupName);
      if (!isDir(groupDir)) continue;
      const methods = groups.get(groupName) ?? new Set<string>();
      for (const entry of readdirSync(groupDir)) {
        if (!entry.endsWith('.mdx')) continue;
        if (entry === 'index.mdx') continue;
        methods.add(entry.slice(0, -'.mdx'.length));
      }
      groups.set(groupName, methods);
    }
  }
  return groups;
}

/**
 * Match strings like:
 *   getClipboardText               → kept
 *   Storage.setItem                → leaf kept (`setItem`)
 *   partner.addAccessoryButton     → leaf kept (`addAccessoryButton`)
 *   env.getDeploymentId            → leaf kept (`getDeploymentId`)
 *   navigator.clipboard.writeText  → rejected (multi-segment Web API path)
 *   navigator.onLine               → rejected (Web API skip-list)
 *   SafeAreaInsets.get             → rejected (sub-namespace skip-list)
 *
 * ApiCards in sdk-example mix three kinds of names: bare camelCase SDK calls
 * (`setClipboardText`), single-segment-namespaced SDK calls (`Storage.setItem`,
 * `partner.addAccessoryButton`), and standard Web API demo cards
 * (`navigator.clipboard.writeText`, `navigator.onLine`). Only the first two
 * participate in the docs deep-link contract — `TryItLink` only emits anchors
 * for SDK methods. We accept either form and strip the prefix; the leaf must
 * be camelCase. Multi-dot names (`a.b.c`) are always Web APIs. Known
 * non-method-bearing prefixes are skip-listed.
 */
const NAME_PATTERN = /^(?:[A-Za-z][A-Za-z0-9]*\.)?([a-z][A-Za-z0-9]*)$/;

/**
 * Card-name prefixes whose leaves should be ignored even if they parse as a
 * camelCase method. `SafeAreaInsets` is a constant object exposed in
 * sdk-example as a sibling to `getSafeAreaInsets`, not a callable namespace —
 * its `.get` accessor is not part of the `TryItLink` deep-link contract.
 * `navigator` cards are standard Web API demos.
 *
 * Add an entry here for any sdk-example single-dot prefix that represents a
 * Web API or non-method object rather than an SDK namespace (e.g. future
 * `location.*`, `history.*`, `document.*`, `screen.*` demo cards). Without
 * this list, those would otherwise leak into `missingInDocs` as info-level
 * noise and break `--strict` runs.
 */
const PREFIX_SKIP_LIST = new Set(['SafeAreaInsets', 'navigator']);

function normalizeApiCardName(raw: string): string | null {
  const m = NAME_PATTERN.exec(raw);
  if (!m) return null;
  const dotIndex = raw.indexOf('.');
  if (dotIndex !== -1) {
    const prefix = raw.slice(0, dotIndex);
    if (PREFIX_SKIP_LIST.has(prefix)) return null;
  }
  return m[1] as string;
}

// Matches JSX prop form:  name="setClipboardText"   (ApiCard)
const NAME_JSX_PROP_REGEX = /name="([^"]+)"/g;

// Matches docsLink calls:  docsLink('clipboard', 'setClipboardText')
// The second argument is the method slug — this is the most reliable signal
// because it explicitly ties a card to a docs deep-link, regardless of which
// card component (ApiCard, PolyfillToggleCard, etc.) is used.
const DOCS_LINK_REGEX = /docsLink\(\s*['"][^'"]+['"]\s*,\s*['"]([^'"]+)['"]\s*\)/g;

// Matches the DocsLink helper component used in sdk-example pages where a
// bespoke (non-ApiCard) card still wants to advertise its docs anchor:
//   <DocsLink namespace="ads" method="loadAppsInTossAdMob" />
// The helper itself calls `docsLink(namespace, method)` internally, but with
// variables — so `DOCS_LINK_REGEX` above misses these call sites. The JSX
// attribute form is the actual author declaration.
const DOCS_LINK_JSX_REGEX = /<DocsLink\b[^>]*\bmethod=["']([^"']+)["']/g;

// Matches the `docsSlug="..."` JSX prop form used by card components that
// forward a docs slug to a nested `<DocsLink />` via a variable (e.g.
// EventsPage's `EventSubscriberCard` passes `method={docsSlug}`). The prop
// name is intentionally specific — author-declared, only used to tie a card
// to a docs slug — so matching it as a literal is safer than trying to track
// variable flow through the component.
const DOCS_SLUG_JSX_REGEX = /\bdocsSlug=["']([^"']+)["']/g;

// Matches PolyfillToggleCard's `sdk={{ name: '...' }}` JSX prop form.
// PolyfillToggleCard receives an `sdk` object prop rather than a plain `name=""`
// prop, so NAME_JSX_PROP_REGEX misses it.  We match the JSX attribute start
// `sdk={{` and then the first `name:` key that follows — this is always the
// sdk.name field (it appears before `description:` and `params:`).
// The regex is non-greedy and stops at the first single-quoted value.
const POLYFILL_TOGGLE_SDK_NAME_REGEX = /sdk=\{\{\s*name:\s*'([^']+)'/g;

// Looser pattern for *explicit* method declarations (`docsLink(...)` second
// arg, `<DocsLink method="..." />`). Author wrote the slug verbatim — accept
// the same shape that `<group>/<slug>.mdx` files use under `docs/api/`, which
// is camelCase optionally containing hyphens for namespaced subjects like
// `graniteEvent-addEventListener`. The narrower `NAME_PATTERN` rejects
// hyphens because it has to defend against false positives from heuristic
// `name="..."` JSX props (those can be free-form display strings).
const EXPLICIT_SLUG_PATTERN = /^([a-z][A-Za-z0-9-]*)$/;

function normalizeExplicitSlug(raw: string): string | null {
  const m = EXPLICIT_SLUG_PATTERN.exec(raw);
  return m ? (m[1] as string) : null;
}

function extractMethodsFromSource(source: string): string[] {
  const out: string[] = [];
  for (const match of source.matchAll(NAME_JSX_PROP_REGEX)) {
    const raw = match[1];
    if (raw === undefined) continue;
    const norm = normalizeApiCardName(raw);
    if (norm) out.push(norm);
  }
  for (const match of source.matchAll(DOCS_LINK_REGEX)) {
    const raw = match[1];
    if (raw === undefined) continue;
    const norm = normalizeExplicitSlug(raw);
    if (norm) out.push(norm);
  }
  for (const match of source.matchAll(DOCS_LINK_JSX_REGEX)) {
    const raw = match[1];
    if (raw === undefined) continue;
    const norm = normalizeExplicitSlug(raw);
    if (norm) out.push(norm);
  }
  for (const match of source.matchAll(DOCS_SLUG_JSX_REGEX)) {
    const raw = match[1];
    if (raw === undefined) continue;
    const norm = normalizeExplicitSlug(raw);
    if (norm) out.push(norm);
  }
  for (const match of source.matchAll(POLYFILL_TOGGLE_SDK_NAME_REGEX)) {
    const raw = match[1];
    if (raw === undefined) continue;
    const norm = normalizeApiCardName(raw);
    if (norm) out.push(norm);
  }
  return Array.from(new Set(out));
}

const FETCH_TIMEOUT_MS = 10_000;

async function fetchSdkPage(group: string, ref: string): Promise<string> {
  const url = `https://raw.githubusercontent.com/${SDK_EXAMPLE_REPO}/${ref}/${sdkPageFilename(group)}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'user-agent': 'verify-crosslinks (apps-in-toss-community/docs)' },
    });
    if (!res.ok) {
      throw new Error(`GET ${url} → HTTP ${res.status}`);
    }
    return await res.text();
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`GET ${url} → timed out after ${FETCH_TIMEOUT_MS}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// Color decision is keyed on stdout — the primary output channel. Edge case:
// `verify-crosslinks --json > report.json` from a terminal will route the
// human summary to stderr (still a TTY) but render it without color because
// stdout is a file. Acceptable: that invocation is for piping to tools, not
// for human reading.
const COLOR = process.stdout.isTTY && !process.env.NO_COLOR;
const c = {
  red: (s: string) => (COLOR ? `\x1b[31m${s}\x1b[0m` : s),
  green: (s: string) => (COLOR ? `\x1b[32m${s}\x1b[0m` : s),
  yellow: (s: string) => (COLOR ? `\x1b[33m${s}\x1b[0m` : s),
  cyan: (s: string) => (COLOR ? `\x1b[36m${s}\x1b[0m` : s),
  dim: (s: string) => (COLOR ? `\x1b[2m${s}\x1b[0m` : s),
  bold: (s: string) => (COLOR ? `\x1b[1m${s}\x1b[0m` : s),
};

async function main(): Promise<number> {
  const args = parseArgs(process.argv.slice(2));

  const docsGroups = scanDocsNamespaces();
  if (docsGroups.size === 0) {
    console.error(
      c.red('No docs namespaces found. Expected files under docs/api/<group>/<method>.mdx.'),
    );
    return 1;
  }

  const reports: NamespaceReport[] = [];
  let fetchFailed = false;

  for (const [group, docsMethodSet] of [...docsGroups.entries()].sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    const docsMethods = [...docsMethodSet].sort();
    let sdkMethods: string[] | null = null;
    let fetchError: string | undefined;
    try {
      const source = await fetchSdkPage(group, args.ref);
      sdkMethods = extractMethodsFromSource(source).sort();
    } catch (err) {
      fetchFailed = true;
      fetchError = err instanceof Error ? err.message : String(err);
    }

    const missingInSdk = sdkMethods ? docsMethods.filter((m) => !sdkMethods.includes(m)) : [];
    const missingInDocs = sdkMethods ? sdkMethods.filter((m) => !docsMethods.includes(m)) : [];

    reports.push({ group, docsMethods, sdkMethods, missingInSdk, missingInDocs, fetchError });
  }

  // Human-readable summary. With `--json`, route to stderr so stdout is pure
  // JSON and pipeable (e.g. `verify:crosslinks --json | jq`).
  const out = (line: string) => {
    if (args.json) console.error(line);
    else console.log(line);
  };
  out(c.bold('\nverify-crosslinks — docs ↔ sdk-example'));
  out(c.dim(`ref: ${args.ref} · strict: ${args.strict ? 'on' : 'off'}\n`));

  let hasError = false;
  let hasInfo = false;
  for (const r of reports) {
    const sdkLabel = r.sdkMethods ? `${r.sdkMethods.length} sdk` : c.yellow('sdk: fetch failed');
    out(`${c.cyan(r.group.padEnd(14))} ${c.dim('|')} ${r.docsMethods.length} docs · ${sdkLabel}`);
    if (r.fetchError) {
      out(`  ${c.yellow('!')} ${r.fetchError}`);
    }
    for (const m of r.missingInSdk) {
      out(`  ${c.red('✗')} ${m} ${c.dim('docs has it; sdk-example does not (link rot risk)')}`);
      hasError = true;
    }
    for (const m of r.missingInDocs) {
      const tag = args.strict ? c.red('✗') : c.yellow('i');
      out(`  ${tag} ${m} ${c.dim('sdk-example has it; docs does not (not yet documented)')}`);
      if (args.strict) hasError = true;
      else hasInfo = true;
    }
    if (r.sdkMethods && r.missingInSdk.length === 0 && r.missingInDocs.length === 0) {
      out(`  ${c.green('✓')} all match`);
    }
  }

  if (args.json) {
    process.stdout.write(
      `${JSON.stringify({ strict: args.strict, ref: args.ref, reports }, null, 2)}\n`,
    );
  }

  // Exit-code precedence: fetch-failure-under-strict (2) > drift (1) > clean (0).
  // When both fetch failures and drift are present under --strict, 2 masks 1 —
  // intentional: a fetch failure means we couldn't fully verify, which is a
  // higher-order signal than a confirmed drift in the namespaces we did reach.
  if (fetchFailed && args.strict) {
    console.error(c.red('\nfetch failure with --strict → exit 2'));
    return 2;
  }
  if (fetchFailed) {
    console.warn(
      c.yellow(
        '\nOne or more sdk-example pages could not be fetched. Cross-link verification skipped for those namespaces. Re-run when GitHub raw is reachable.',
      ),
    );
  }
  if (hasError) {
    console.error(c.red('\nverify-crosslinks: FAIL'));
    return 1;
  }
  if (hasInfo) {
    out(c.dim('\nverify-crosslinks: ok (info-level drift; pass --strict to fail on docs gaps)'));
  } else {
    out(c.green('\nverify-crosslinks: ok'));
  }
  return 0;
}

main().then(
  (code) => process.exit(code),
  (err) => {
    console.error(
      c.red(
        `verify-crosslinks: unexpected error: ${err instanceof Error ? (err.stack ?? err.message) : String(err)}`,
      ),
    );
    process.exit(2);
  },
);
