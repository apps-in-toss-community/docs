# docs

[한국어](./README.md)

**Apps in Toss** mini-app community documentation site. A community-curated reference built around the SDK — guides + reference. Content is early-stage; pushes to `main` trigger an automatic deploy via GitHub Actions.

## Goal

- **Getting started** — practical guide from zero to deploying a mini-app
- **Recipes** — copy-paste-oriented snippets for common scenarios (IAP, Ads, Permissions, …)
- **API reference** — the original SDK reference, re-organized for readability
- **한국어 + English** — Korean default, English mirror

## Stack

- **Docusaurus 3.10** (classic preset, TypeScript, MDX)
- **pnpm** 10.33.0 — package manager
- **Biome** — lint + formatter (excludes `*.md`/`*.mdx` to preserve Docusaurus/MDX conventions)
- **i18n**: default `ko`, additional `en` (`i18n/en/docusaurus-plugin-content-docs/current/`)

For framework rationale and architectural details, see [`CLAUDE.md`](./CLAUDE.md).

## Quickstart (contributors)

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build        # static output in build/
pnpm serve        # preview the built site
pnpm typecheck    # tsc --noEmit
pnpm lint         # biome check .
pnpm lint:fix     # biome check --write .
pnpm format       # biome format --write .
pnpm verify:crosslinks  # check docs ↔ sdk-example name parity
```

## Pre-commit hook

Optional but recommended. After cloning, enable the standard pre-commit hook with one line (it runs `biome check` against staged files):

```sh
git config core.hooksPath .githooks
```

This is a developer convenience for fast feedback before pushing. CI runs the same checks as the actual enforcement layer, so contributors who haven't enabled the hook will still see lint failures at PR time.

## Cross-link verification

`pnpm verify:crosslinks` checks that every method documented under `docs/api/<group>/<method>.mdx` (and its `i18n/en/...` mirror) has a matching `ApiCard name="..."` prop in the corresponding `apps-in-toss-community/sdk-example` page. Drift here silently breaks the `TryItLink` deep-links.

**Adding a new namespace**: pick the same `<group>` slug in both repos. The docs slug is the lowercase namespace name (e.g. `clipboard`, `storage`); the sdk-example file is `src/pages/<Capitalized>Page.tsx` containing `<ApiCard name="<methodName>" ... />` for each method. Method names are SDK export names (camelCase). The verifier accepts three card-name shapes from sdk-example and reduces them to the docs slug:

- `setClipboardText` → `setClipboardText`
- `Storage.setItem` → `setItem` (PascalCase namespace prefix stripped)
- `partner.addAccessoryButton` → `addAccessoryButton` (lowercase namespace prefix stripped)

Multi-dot names (`navigator.clipboard.writeText`) are rejected by the regex — only single-prefix form is accepted. Single-dot names with known non-SDK prefixes (`navigator.onLine`, `SafeAreaInsets.get`) are rejected by `PREFIX_SKIP_LIST` in the script — extend it if sdk-example gains demo cards for other Web APIs (`location.*`, `history.*`, etc.). If the sdk-example file casing diverges from `Capitalize(group) + 'Page.tsx'` (acronym groups like `iap → IAPPage.tsx`), add the override in `SDK_PAGE_FILENAME_OVERRIDES`.

```bash
pnpm verify:crosslinks            # docs methods missing in sdk-example → error
pnpm verify:crosslinks --strict   # also: sdk-example methods missing in docs → error
pnpm verify:crosslinks --ref <branch>  # check against a non-main sdk-example ref
```

CI runs the default mode on every PR (job: `verify-crosslinks`). External fetch failures (GitHub raw down, rate limit) warn and exit 0 by default — an sdk-example outage shouldn't block docs PRs. Use `--strict` locally to fail closed when you want certainty.

## Deploy

Deploy URL: **`https://docs.aitc.dev/`** (dedicated sub-domain).

- **Workflow**: [`.github/workflows/deploy-pages.yml`](./.github/workflows/deploy-pages.yml) — `main` push + `workflow_dispatch`. `pnpm build` → `actions/upload-pages-artifact@v3` → `actions/deploy-pages@v4`.
- **CI**: [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) — the `check` job runs lint + typecheck + build dry-run; the `verify-crosslinks` job runs `pnpm verify:crosslinks`.
- **Version policy**: none. `main` = deploy (Type C, no Changesets).
- **Pages source**: repo Settings → Pages → "GitHub Actions" (already enabled).

## Roadmap

Scaffold is complete. See the [landing page](https://aitc.dev/) for the org-wide roadmap.

## Pair repos

- [`sdk-example`](https://github.com/apps-in-toss-community/sdk-example) — downstream consumer. Each API page deep-links to sdk-example (`/docs/api/<group>/<method>` ↔ `/sdk-example/<group>#<method>`). See `CLAUDE.md` for the bidirectional URL contract.

---

Community open-source project.
