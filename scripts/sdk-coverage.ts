#!/usr/bin/env -S node --no-warnings
/**
 * sdk-coverage
 *
 * Compares the live `@apps-in-toss/web-framework` export surface to the docs
 * inventory under `docs/api/<group>/<method>.mdx` (+ en mirror) and reports
 * drift in four categories:
 *
 *   1. undocumented      — SDK exports with no corresponding docs page
 *   2. orphaned          — docs pages whose method name no longer exports
 *   3. signature-changed — documented exports whose call signature differs
 *                          from the baseline (hash mismatch)
 *   4. i18n-missing      — ko ↔ en page set out of sync within a namespace
 *
 * The script is read-only and side-effect free. Output is structured JSON
 * (stdout) + a Markdown report (`--report path` or `./sdk-coverage-report.md`).
 *
 * The SDK is installed as a regular `devDependency`. Its dist `.d.ts` is read
 * with the TypeScript Compiler API so we get real signature types, not
 * regex-parsed strings. The package re-exports
 * `@apps-in-toss/webview-bridge` (which absorbed web-analytics in 3.0), so we
 * also pull those transitively.
 *
 * Group resolution: docs `<group>` slugs ≠ SDK export names. A static
 * group-map (`GROUP_MAP` below) assigns every SDK export to a docs `<group>`.
 * New SDK exports that don't match any group fall into the "ungrouped" bucket
 * — they still surface in the report, just without a target page path.
 *
 * Exit codes:
 *   0 — no drift OR `--no-fail-on-drift` (default behavior is non-zero on drift
 *       so CI/cron can branch on it, but local `pnpm coverage:check` prints the
 *       report regardless)
 *   1 — drift detected (any of the four categories non-empty)
 *   2 — unexpected error (SDK not installed, baseline malformed, etc.)
 *
 * Flags:
 *   --update-baseline   write the live snapshot back to `coverage-baseline.json`.
 *                       Use after a deliberate SDK bump + docs update lands.
 *   --no-fail-on-drift  exit 0 even when drift is detected. CI uses this to keep
 *                       the dry-run informational; the weekly cron does not.
 *   --report <path>     where to write the Markdown report (default:
 *                       ./sdk-coverage-report.md). Pass `-` to skip.
 *   --json              also print the structured diff to stdout as JSON.
 */

import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const require = createRequire(import.meta.url);

const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url));
const DOCS_API_DIRS = [
  join(REPO_ROOT, 'docs', 'api'),
  join(REPO_ROOT, 'i18n', 'en', 'docusaurus-plugin-content-docs', 'current', 'api'),
];
const SDK_PACKAGE = '@apps-in-toss/web-framework';
const BASELINE_PATH = join(REPO_ROOT, 'coverage-baseline.json');

/**
 * Static map from SDK export name → docs `<group>` slug.
 *
 * Source of truth: `sidebars.ts` defines docs `<group>`s; sdk-example
 * `pages/XxxPage.tsx` mirrors them. SDK exports come from
 * `@apps-in-toss/webview-bridge` (which absorbed web-analytics in 3.0). The mapping is
 * static (not heuristic) so a typo here is loud — the script prints
 * `ungrouped:` for any export not listed.
 *
 * When a new SDK export lands, add it here (or to `IGNORED_EXPORTS` if it's a
 * type-only export, an internal helper, or a deliberately undocumented
 * surface). Don't try to infer the group from the name; the SDK's grouping is
 * inconsistent (e.g. `getTossShareLink` → navigation, `getServerTime` →
 * environment).
 */
const GROUP_MAP: Record<string, string> = {
  // clipboard
  getClipboardText: 'clipboard',
  setClipboardText: 'clipboard',
  // haptic
  generateHapticFeedback: 'haptic',
  // storage
  saveBase64Data: 'storage',
  // location
  getCurrentLocation: 'location',
  startUpdateLocation: 'location',
  // navigation
  closeView: 'navigation',
  getTossShareLink: 'navigation',
  openURL: 'navigation',
  requestReview: 'navigation',
  setDeviceOrientation: 'navigation',
  setIosSwipeGestureEnabled: 'navigation',
  setScreenAwakeMode: 'navigation',
  setSecureScreen: 'navigation',
  share: 'navigation',
  // storage (Storage namespace object — leaves promoted to docs)
  Storage: 'storage',
  // contacts
  fetchContacts: 'contacts',
  // camera — `fetchAlbumPhotos` is documented here (and rendered on
  // sdk-example's CameraPage) even though the SDK re-exports it flat.
  openCamera: 'camera',
  fetchAlbumPhotos: 'camera',
  // environment
  env: 'environment',
  getLocale: 'environment',
  getPlatformOS: 'environment',
  getOperationalEnvironment: 'environment',
  getTossAppVersion: 'environment',
  getSchemeUri: 'environment',
  getDeviceId: 'environment',
  getGroupId: 'environment',
  getNetworkStatus: 'environment',
  getServerTime: 'environment',
  isMinVersionSupported: 'environment',
  getAppsInTossGlobals: 'environment',
  getSafeAreaInsets: 'environment',
  subscribeSafeAreaInsets: 'environment',
  SafeAreaInsets: 'environment',
  // permissions (cross-cutting)
  getPermission: 'permissions',
  requestPermission: 'permissions',
  openPermissionDialog: 'permissions',
  // auth — `getUserKeyForGame` is rendered on sdk-example's AuthPage
  // (it's the deprecated predecessor of `getAnonymousKey`).
  appLogin: 'auth',
  getIsTossLoginIntegratedService: 'auth',
  appsInTossSignTossCert: 'auth',
  getAnonymousKey: 'auth',
  getUserKeyForGame: 'auth',
  // payment
  requestTossPayPaysBilling: 'payment',
  // iap — `checkoutPayment` is rendered on sdk-example's IAPPage even
  // though the SDK re-exports it flat at the top level.
  IAP: 'iap',
  checkoutPayment: 'iap',
  // ads
  GoogleAdMob: 'ads',
  TossAds: 'ads',
  loadFullScreenAd: 'ads',
  showFullScreenAd: 'ads',
  // game — `contactsViral` lives on sdk-example's GamePage (via a
  // custom ContactsViralCard component, not a stock ApiCard) so it
  // docs here too.
  getGameCenterGameProfile: 'game',
  openGameCenterLeaderboard: 'game',
  submitGameCenterLeaderBoardScore: 'game',
  grantPromotionReward: 'game',
  grantPromotionRewardForGame: 'game',
  contactsViral: 'game',
  // events
  appsInTossEvent: 'events',
  tdsEvent: 'events',
  graniteEvent: 'events',
  onVisibilityChangedByTransparentServiceWeb: 'events',
  // notification
  requestNotificationAgreement: 'notification',
  // partner
  partner: 'partner',
  // analytics (from web-analytics) — `eventLog` lives here too, to match
  // sdk-example's AnalyticsPage which renders the ApiCard.
  Analytics: 'analytics',
  eventLog: 'analytics',
};

/**
 * SDK exports that are deliberately not part of the docs surface. Mostly
 * type-only exports and helper-of-helpers. Keep this list tight — when in
 * doubt, add to GROUP_MAP instead and write a docs page.
 */
const IGNORED_EXPORTS = new Set<string>([
  // PermissionError classes — these are thrown by the matching SDK method
  // (e.g. `GetClipboardTextPermissionError` from `getClipboardText`) and are
  // documented inside the method page's "Permissions" section. No standalone
  // page makes sense; flagging them as undocumented is pure noise.
  // Base class added in 3.0.
  'PermissionError',
  'FetchAlbumPhotosPermissionError',
  'FetchContactsPermissionError',
  'GetClipboardTextPermissionError',
  'GetCurrentLocationPermissionError',
  'OpenCameraPermissionError',
  'SetClipboardTextPermissionError',
  'StartUpdateLocationPermissionError',
  // New 3.0 exports not yet documented — tracked in separate issues.
  'fetchAlbumItems',
  'openPDFViewer',
  // Bridge construction helpers re-exported from `@apps-in-toss/bridge-core`.
  // These are SDK-internal building blocks for defining new bridges, not
  // consumer-facing API. Not part of our docs surface.
  'createAsyncBridge',
  'createConstantBridge',
  'createEventBridge',
]);

interface ExportInfo {
  name: string;
  kind: 'function' | 'const' | 'class' | 'namespace' | 'type';
  /** Signature hash. Stable across cosmetic upstream renames; changes when
   *  the externally observable call shape changes. */
  hash: string;
}

interface Baseline {
  sdkPackage: string;
  sdkVersion: string;
  exports: ExportInfo[];
}

interface NamespaceDocs {
  group: string;
  koMethods: Set<string>;
  enMethods: Set<string>;
  /** Union of ko + en. The docs PR convention is 1:1 mirror; missing pages
   *  on one side are reported as i18n-missing. */
  methods: Set<string>;
}

interface DriftReport {
  sdkPackage: string;
  sdkVersionBaseline: string;
  sdkVersionLive: string;
  generatedAt: string;
  undocumented: { name: string; group: string | null }[];
  orphaned: { group: string; method: string }[];
  signatureChanged: { name: string; before: string; after: string }[];
  i18nMissing: { group: string; missingIn: 'ko' | 'en'; methods: string[] }[];
  ungrouped: string[];
}

function isDir(p: string): boolean {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function findPackageRoot(pkg: string): string {
  // Resolve the package root by walking up from any resolved file in the
  // package. We first try `package.json` directly (works when the package
  // exposes it via `exports`), then fall back to resolving any known entry
  // point and traversing up until we find a `package.json` — this covers
  // packages that lock down their `exports` map (3.0+ pattern).
  try {
    const pkgJson = require.resolve(`${pkg}/package.json`);
    return dirname(pkgJson);
  } catch {
    // package.json not in exports map — resolve the package root from the
    // node_modules path of the package itself.
    const pkgDir = join(REPO_ROOT, 'node_modules', pkg);
    if (existsSync(join(pkgDir, 'package.json'))) return pkgDir;
    throw new Error(
      `${SDK_PACKAGE} is not installed. Run \`pnpm install\` (it's a devDependency).`,
    );
  }
}

function readSdkVersion(): string {
  const root = findPackageRoot(SDK_PACKAGE);
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
    version: string;
  };
  return pkg.version;
}

function resolveEntryDts(pkg: string): string {
  const root = findPackageRoot(pkg);
  const pkgJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
    types?: string;
    main?: string;
    exports?: Record<string, unknown>;
  };
  // Prefer the dot-export's `types` (ESM-style), fall back to top-level
  // `types`, then guess `dist/index.d.ts`.
  const dot = pkgJson.exports?.['.'];
  if (dot && typeof dot === 'object') {
    const flat = dot as Record<string, unknown>;
    for (const key of ['types', 'import', 'default']) {
      const v = flat[key];
      if (typeof v === 'string' && v.endsWith('.d.ts')) {
        return join(root, v);
      }
      if (v && typeof v === 'object') {
        const inner = v as Record<string, unknown>;
        const t = inner.types;
        if (typeof t === 'string') return join(root, t);
      }
    }
  }
  if (pkgJson.types) return join(root, pkgJson.types);
  return join(root, 'dist', 'index.d.ts');
}

/**
 * Build a TS program rooted at the SDK's entry d.ts and harvest every
 * top-level export with a stable signature hash.
 *
 * Why a real Program (not regex): the SDK uses `export *` chains across
 * several files; the only reliable way to enumerate the effective surface
 * after re-exports is to ask the TypeScript checker. We also want the
 * checker's resolved signature so the hash is stable even when the SDK
 * shuffles internal type aliases.
 */
function readSdkExports(): ExportInfo[] {
  const entry = resolveEntryDts(SDK_PACKAGE);
  if (!existsSync(entry)) {
    throw new Error(`SDK entry d.ts not found at ${entry}. Did pnpm install run?`);
  }

  const program = ts.createProgram({
    rootNames: [entry],
    options: {
      noEmit: true,
      declaration: false,
      skipLibCheck: true,
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      allowJs: false,
      strict: false,
    },
  });
  const checker = program.getTypeChecker();
  const source = program.getSourceFile(entry);
  if (!source) {
    throw new Error(`TypeScript could not load source file: ${entry}`);
  }
  const moduleSymbol = checker.getSymbolAtLocation(source);
  if (!moduleSymbol) {
    throw new Error(`No module symbol resolved for ${entry}`);
  }
  const symbols = checker.getExportsOfModule(moduleSymbol);

  const out: ExportInfo[] = [];
  for (const sym of symbols) {
    const name = sym.getName();
    if (IGNORED_EXPORTS.has(name)) continue;

    // Resolve through alias chains (re-exports). The SDK chains
    // `index → webview-bridge → ./bridge → ./getClipboardText`; the final
    // declaration is what tells us whether this is a value vs type-only.
    let resolved = sym;
    if ((sym.getFlags() & ts.SymbolFlags.Alias) !== 0) {
      resolved = checker.getAliasedSymbol(sym);
    }
    const flags = resolved.getFlags();
    const isValue =
      (flags & ts.SymbolFlags.Function) !== 0 ||
      (flags & ts.SymbolFlags.Class) !== 0 ||
      (flags & ts.SymbolFlags.Variable) !== 0 ||
      (flags & ts.SymbolFlags.BlockScopedVariable) !== 0 ||
      (flags & ts.SymbolFlags.FunctionScopedVariable) !== 0 ||
      (flags & ts.SymbolFlags.ValueModule) !== 0;
    if (!isValue) continue;

    const decl = resolved.declarations?.[0] ?? sym.declarations?.[0];
    let kind: ExportInfo['kind'] = 'const';
    if (decl) {
      if (ts.isFunctionDeclaration(decl)) kind = 'function';
      else if (ts.isClassDeclaration(decl)) kind = 'class';
      else if (ts.isModuleDeclaration(decl)) kind = 'namespace';
      else if (ts.isInterfaceDeclaration(decl) || ts.isTypeAliasDeclaration(decl)) kind = 'type';
    }
    if (kind === 'type') continue;

    const type = checker.getTypeOfSymbolAtLocation(sym, decl ?? source);
    // typeToString returns a stable textual form of the resolved type. We
    // strip whitespace runs to make hashes resilient to formatter changes.
    const sig = checker
      .typeToString(
        type,
        decl ?? source,
        ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseFullyQualifiedType,
      )
      .replace(/\s+/g, ' ')
      .trim();
    const hash = createHash('sha256').update(sig).digest('hex').slice(0, 16);
    out.push({ name, kind, hash });
  }
  out.sort((a, b) => a.name.localeCompare(b.name));
  return out;
}

function readBaseline(): Baseline | null {
  if (!existsSync(BASELINE_PATH)) return null;
  return JSON.parse(readFileSync(BASELINE_PATH, 'utf8')) as Baseline;
}

function writeBaseline(b: Baseline): void {
  writeFileSync(BASELINE_PATH, `${JSON.stringify(b, null, 2)}\n`);
}

function scanDocs(): Map<string, NamespaceDocs> {
  const out = new Map<string, NamespaceDocs>();
  const locales: ('ko' | 'en')[] = ['ko', 'en'];
  for (let i = 0; i < DOCS_API_DIRS.length; i++) {
    const root = DOCS_API_DIRS[i];
    const locale = locales[i];
    if (!isDir(root)) continue;
    for (const groupName of readdirSync(root)) {
      const groupDir = join(root, groupName);
      if (!isDir(groupDir)) continue;
      const ns =
        out.get(groupName) ??
        ({
          group: groupName,
          koMethods: new Set(),
          enMethods: new Set(),
          methods: new Set(),
        } satisfies NamespaceDocs);
      for (const entry of readdirSync(groupDir)) {
        if (!entry.endsWith('.mdx')) continue;
        if (entry === 'index.mdx') continue;
        const method = entry.slice(0, -'.mdx'.length);
        ns.methods.add(method);
        if (locale === 'ko') ns.koMethods.add(method);
        else ns.enMethods.add(method);
      }
      out.set(groupName, ns);
    }
  }
  return out;
}

/**
 * For `Storage`/`IAP`/`TossAds`/`GoogleAdMob`/`partner`/`env`-style namespace
 * objects, the SDK exposes a single value whose members are the documented
 * "methods". The docs pages are written per-member (e.g.
 * `docs/api/storage/getItem.mdx`), so we expand those container exports here.
 *
 * For now, the expansion is hardcoded — we know the member names from the
 * dist d.ts at 3.0.0-beta.9d42c0b. If we want to track member-level signature drift, we'd
 * need to recurse into the container's properties via the checker. Out of
 * scope for this first cut; the script's job is to surface missing
 * top-level coverage. Member-level drift is caught by sidebars + manual PR
 * review when a new method appears under a known namespace.
 */
const NAMESPACE_MEMBERS: Record<string, string[]> = {
  Storage: ['getItem', 'setItem', 'removeItem', 'clearItems'],
  IAP: [
    'createOneTimePurchaseOrder',
    'createSubscriptionPurchaseOrder',
    'getProductItemList',
    'getPendingOrders',
    'getCompletedOrRefundedOrders',
    'completeProductGrant',
    'getSubscriptionInfo',
  ],
  GoogleAdMob: ['loadAppsInTossAdMob', 'showAppsInTossAdMob', 'isAppsInTossAdMobLoaded'],
  TossAds: ['initialize', 'attach', 'attachBanner', 'destroy', 'destroyAll'],
  partner: ['addAccessoryButton', 'removeAccessoryButton'],
  // Three event namespaces share the leaf `addEventListener`. To dodge the
  // filename collision in `docs/api/events/`, each gets a `<container>-addEventListener.mdx`
  // page (with frontmatter `slug: /api/events/<container>.addEventListener` to preserve
  // the URL contract).
  appsInTossEvent: ['appsInTossEvent-addEventListener'],
  tdsEvent: ['tdsEvent-addEventListener'],
  graniteEvent: ['graniteEvent-addEventListener'],
  Analytics: ['screen', 'impression', 'click'],
  // env namespace object — its one member is documented under
  // api/environment/getDeploymentId.mdx (matches sdk-example's
  // ApiCard name="env.getDeploymentId" which normalizes to the leaf).
  env: ['getDeploymentId'],
};

function expectedDocsMethodsFor(name: string): string[] {
  if (NAMESPACE_MEMBERS[name]) return NAMESPACE_MEMBERS[name];
  return [name];
}

function buildReport(live: ExportInfo[], baseline: Baseline | null): DriftReport {
  const docs = scanDocs();
  const liveVersion = readSdkVersion();
  const baselineVersion = baseline?.sdkVersion ?? '(none)';

  const undocumented: DriftReport['undocumented'] = [];
  const ungrouped: string[] = [];
  const signatureChanged: DriftReport['signatureChanged'] = [];

  const baselineByName = new Map(baseline?.exports.map((e) => [e.name, e]) ?? []);

  for (const exp of live) {
    const group = GROUP_MAP[exp.name];
    if (!group) {
      ungrouped.push(exp.name);
      undocumented.push({ name: exp.name, group: null });
      continue;
    }
    const ns = docs.get(group);
    const expected = expectedDocsMethodsFor(exp.name);
    const haveAll = ns && expected.every((m) => ns.methods.has(m));
    if (!haveAll) {
      undocumented.push({ name: exp.name, group });
    }
    const prior = baselineByName.get(exp.name);
    if (prior && prior.hash !== exp.hash) {
      signatureChanged.push({ name: exp.name, before: prior.hash, after: exp.hash });
    }
  }

  const liveByName = new Map(live.map((e) => [e.name, e]));
  const knownGroupValues = new Set(Object.values(GROUP_MAP));
  const liveGroups = new Set<string>();
  for (const exp of live) {
    const g = GROUP_MAP[exp.name];
    if (g) liveGroups.add(g);
  }

  // Orphaned: docs methods that aren't covered by any live SDK export.
  const orphaned: DriftReport['orphaned'] = [];
  for (const [group, ns] of docs) {
    if (!knownGroupValues.has(group)) {
      // The docs group isn't in our group map at all — every method is
      // orphaned by definition. Report each.
      for (const method of ns.methods) orphaned.push({ group, method });
      continue;
    }
    const expectedMethods = new Set<string>();
    for (const [exportName, g] of Object.entries(GROUP_MAP)) {
      if (g !== group) continue;
      if (!liveByName.has(exportName)) continue;
      for (const m of expectedDocsMethodsFor(exportName)) expectedMethods.add(m);
    }
    for (const method of ns.methods) {
      if (!expectedMethods.has(method)) orphaned.push({ group, method });
    }
  }

  // i18n drift inside documented namespaces.
  const i18nMissing: DriftReport['i18nMissing'] = [];
  for (const [group, ns] of docs) {
    const koOnly = [...ns.koMethods].filter((m) => !ns.enMethods.has(m));
    const enOnly = [...ns.enMethods].filter((m) => !ns.koMethods.has(m));
    if (koOnly.length > 0) i18nMissing.push({ group, missingIn: 'en', methods: koOnly });
    if (enOnly.length > 0) i18nMissing.push({ group, missingIn: 'ko', methods: enOnly });
  }

  return {
    sdkPackage: SDK_PACKAGE,
    sdkVersionBaseline: baselineVersion,
    sdkVersionLive: liveVersion,
    generatedAt: new Date().toISOString(),
    undocumented,
    orphaned,
    signatureChanged,
    i18nMissing,
    ungrouped,
  };
}

function renderMarkdown(r: DriftReport): string {
  const lines: string[] = [];
  lines.push(`# SDK coverage drift report`);
  lines.push('');
  lines.push(`- **Package**: \`${r.sdkPackage}\``);
  lines.push(`- **Baseline version**: \`${r.sdkVersionBaseline}\``);
  lines.push(`- **Live version**: \`${r.sdkVersionLive}\``);
  lines.push(`- **Generated**: ${r.generatedAt}`);
  lines.push('');
  const total =
    r.undocumented.length + r.orphaned.length + r.signatureChanged.length + r.i18nMissing.length;
  if (total === 0) {
    lines.push('✅ No drift. Live SDK surface is fully covered by docs at parity.');
    return `${lines.join('\n')}\n`;
  }

  if (r.signatureChanged.length > 0) {
    lines.push('## Signature changed');
    lines.push('');
    lines.push('Existing docs may be stale. Check each page against the new shape.');
    lines.push('');
    lines.push('| Export | before | after |');
    lines.push('| --- | --- | --- |');
    for (const c of r.signatureChanged) {
      lines.push(`| \`${c.name}\` | \`${c.before}\` | \`${c.after}\` |`);
    }
    lines.push('');
  }

  if (r.undocumented.length > 0) {
    lines.push('## Undocumented SDK exports');
    lines.push('');
    lines.push(
      'SDK exports with no corresponding `docs/api/<group>/<method>.mdx` page. New API surface lives here.',
    );
    lines.push('');
    lines.push('| Export | Target group |');
    lines.push('| --- | --- |');
    for (const u of r.undocumented) {
      lines.push(`| \`${u.name}\` | ${u.group ?? '_(ungrouped)_'} |`);
    }
    lines.push('');
  }

  if (r.orphaned.length > 0) {
    lines.push('## Orphaned docs pages');
    lines.push('');
    lines.push(
      'Docs pages whose method name is no longer exported by the SDK. Either the SDK removed it (delete the page) or this script needs a `GROUP_MAP` entry.',
    );
    lines.push('');
    lines.push('| Group | Method |');
    lines.push('| --- | --- |');
    for (const o of r.orphaned) {
      lines.push(`| ${o.group} | \`${o.method}\` |`);
    }
    lines.push('');
  }

  if (r.i18nMissing.length > 0) {
    lines.push('## i18n drift (ko ↔ en)');
    lines.push('');
    lines.push(
      'Pages present on one side but missing on the other. The repo convention is 1:1 mirror.',
    );
    lines.push('');
    lines.push('| Group | Missing locale | Methods |');
    lines.push('| --- | --- | --- |');
    for (const i of r.i18nMissing) {
      lines.push(
        `| ${i.group} | \`${i.missingIn}\` | ${i.methods.map((m) => `\`${m}\``).join(', ')} |`,
      );
    }
    lines.push('');
  }

  if (r.ungrouped.length > 0) {
    lines.push('## Ungrouped SDK exports');
    lines.push('');
    lines.push(
      'SDK exports without an entry in `scripts/sdk-coverage.ts → GROUP_MAP`. Either route them to a `<group>` or add to `IGNORED_EXPORTS`.',
    );
    lines.push('');
    for (const name of r.ungrouped) lines.push(`- \`${name}\``);
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}

function main(): void {
  const argv = process.argv.slice(2);
  let updateBaseline = false;
  let failOnDrift = true;
  let reportPath: string | null = join(REPO_ROOT, 'sdk-coverage-report.md');
  let printJson = false;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--update-baseline') updateBaseline = true;
    else if (a === '--no-fail-on-drift') failOnDrift = false;
    else if (a === '--json') printJson = true;
    else if (a === '--report') {
      const next = argv[++i];
      if (!next) throw new Error('--report requires a value (- to disable)');
      reportPath = next === '-' ? null : next;
    } else {
      throw new Error(`Unknown argument: ${a}`);
    }
  }

  const live = readSdkExports();
  const baseline = readBaseline();
  const report = buildReport(live, baseline);

  if (printJson) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  }

  const md = renderMarkdown(report);
  if (reportPath) {
    writeFileSync(reportPath, md);
    process.stderr.write(`coverage report → ${relative(REPO_ROOT, reportPath)}\n`);
  }

  if (updateBaseline) {
    writeBaseline({
      sdkPackage: SDK_PACKAGE,
      sdkVersion: readSdkVersion(),
      exports: live,
    });
    process.stderr.write(`baseline updated → coverage-baseline.json (sdk ${readSdkVersion()})\n`);
  }

  const drift =
    report.undocumented.length +
    report.orphaned.length +
    report.signatureChanged.length +
    report.i18nMissing.length;
  if (drift > 0 && failOnDrift) process.exit(1);
}

try {
  main();
} catch (err) {
  process.stderr.write(`sdk-coverage: ${(err as Error).message}\n`);
  process.exit(2);
}
