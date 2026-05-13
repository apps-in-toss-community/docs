# docs

> 🚧 **Work in Progress** — 콘텐츠는 초기 단계지만, 사이트는 라이브입니다. `main` 푸시 시 GitHub Actions로 자동 배포됩니다.

**Apps in Toss** 미니앱 개발을 위한 커뮤니티 문서 사이트. 앱인토스 공식 문서를 기반으로 재구성한 **가이드/레퍼런스** 세트입니다.

## Goal

- **Getting started** — 처음부터 미니앱 하나 배포까지의 실전 가이드
- **Recipes** — 흔한 시나리오(IAP, Ads, Permissions 등)의 복사-붙여넣기 지향 스니펫
- **API reference** — 원본 SDK 레퍼런스를 더 읽기 쉽게 재구성
- **한국어 + English** — 한국어 default, 영어 mirror

## Stack

- **Docusaurus 3.10** (classic preset, TypeScript, MDX)
- **pnpm** 10.33.0 — 패키지 매니저
- **Biome** — lint + formatter (`*.md`/`*.mdx`는 제외, Docusaurus/MDX 컨벤션 유지)
- **i18n**: 기본 `ko`, 추가 `en` (`i18n/en/docusaurus-plugin-content-docs/current/`)

프레임워크 선정 근거와 아키텍처 세부는 [`CLAUDE.md`](./CLAUDE.md) 참고.

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

선택 사항이지만 권장합니다. clone 후 다음 한 줄로 표준 pre-commit hook을 활성화하세요 (staged 파일에 `biome check` 실행):

```sh
git config core.hooksPath .githooks
```

push 전 빠른 피드백을 위한 개발자 편의 기능입니다. CI가 동일한 검사를 실제 강제 계층으로 실행하므로, hook을 활성화하지 않은 contributor도 PR 단계에서 lint 실패를 확인하게 됩니다.

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

CI runs the default mode on every PR (job: `verify-crosslinks`). External fetch failures (GitHub raw down, rate limit) warn and exit 0 by default — sdk-example outage shouldn't block docs PRs. Use `--strict` locally to fail closed when you want certainty.

## Deploy

배포 URL: **`https://docs.aitc.dev/`** (전용 sub-domain).

- **워크플로**: [`.github/workflows/deploy-pages.yml`](./.github/workflows/deploy-pages.yml) — `main` push + `workflow_dispatch`. `pnpm build` → `actions/upload-pages-artifact@v3` → `actions/deploy-pages@v4`.
- **CI**: [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) — `check` job runs lint + typecheck + build dry-run; `verify-crosslinks` job runs `pnpm verify:crosslinks`.
- **버전 정책**: 없음. `main` = 배포 (Type C, Changesets 미사용).
- **Pages source**: repo Settings → Pages → "GitHub Actions" (이미 활성화됨).

## Roadmap

현재 스캐폴드 완료 단계. 남은 작업은 [`TODO.md`](./TODO.md) 참고.

조직 전체 로드맵은 [landing page](https://aitc.dev/) 참고.

## Pair repos

- [`sdk-example`](https://github.com/apps-in-toss-community/sdk-example) — downstream consumer. 각 API 페이지에서 sdk-example로 deep-link (`/docs/api/<group>/<method>` ↔ `/sdk-example/<group>#<method>`). 양방향 URL 계약은 `CLAUDE.md` 참고.

---

토스와 제휴하지 않은 커뮤니티 프로젝트입니다.
