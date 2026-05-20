# docs

[English](./README.en.md)

**Apps in Toss** 미니앱 개발을 위한 커뮤니티 문서 사이트. 가이드/레퍼런스 세트입니다. `main` 푸시 시 GitHub Actions로 자동 배포됩니다.

## 목표

- **Getting started** — 처음부터 미니앱 하나 배포까지의 실전 가이드
- **Recipes** — 흔한 시나리오(IAP, Ads, Permissions 등)의 복사-붙여넣기 지향 스니펫
- **API reference** — 원본 SDK 레퍼런스를 더 읽기 쉽게 재구성
- **한국어 + English** — 한국어 default, 영어 mirror

## 기술 스택

- **Docusaurus 3.10** (classic preset, TypeScript, MDX)
- **pnpm** 10.33.0 — 패키지 매니저
- **Biome** — lint + formatter (`*.md`/`*.mdx`는 제외, Docusaurus/MDX 컨벤션 유지)
- **i18n**: 기본 `ko`, 추가 `en` (`i18n/en/docusaurus-plugin-content-docs/current/`)

프레임워크 선정 근거와 아키텍처 세부는 [`CLAUDE.md`](./CLAUDE.md) 참고.

## 빠른 시작 (contributor)

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

## Pre-commit 훅

선택 사항이지만 권장합니다. clone 후 다음 한 줄로 표준 pre-commit hook을 활성화하세요 (staged 파일에 `biome check` 실행):

```sh
git config core.hooksPath .githooks
```

push 전 빠른 피드백을 위한 개발자 편의 기능입니다. CI가 동일한 검사를 실제 강제 계층으로 실행하므로, hook을 활성화하지 않은 contributor도 PR 단계에서 lint 실패를 확인하게 됩니다.

## 크로스링크 검증

`pnpm verify:crosslinks`는 `docs/api/<group>/<method>.mdx`(및 `i18n/en/...` mirror)에 문서화된 모든 메서드가 대응하는 `apps-in-toss-community/sdk-example` 페이지의 `ApiCard name="..."` prop과 일치하는지 검사합니다. 여기서 drift가 생기면 `TryItLink` deep-link가 조용히 깨집니다.

**새 네임스페이스 추가**: 두 repo에서 같은 `<group>` slug를 사용합니다. docs slug는 소문자 네임스페이스 이름(예: `clipboard`, `storage`)이고, sdk-example 파일은 각 메서드마다 `<ApiCard name="<methodName>" ... />`를 담은 `src/pages/<Capitalized>Page.tsx`입니다. 메서드 이름은 SDK export 이름(camelCase)입니다. 검증기는 sdk-example의 card 이름을 세 가지 형태로 받아 docs slug로 환원합니다:

- `setClipboardText` → `setClipboardText`
- `Storage.setItem` → `setItem` (PascalCase 네임스페이스 prefix 제거)
- `partner.addAccessoryButton` → `addAccessoryButton` (소문자 네임스페이스 prefix 제거)

다중 점 이름(`navigator.clipboard.writeText`)은 정규식에서 거부됩니다 — 단일 prefix 형태만 허용합니다. SDK가 아닌 알려진 prefix를 가진 단일 점 이름(`navigator.onLine`, `SafeAreaInsets.get`)은 스크립트의 `PREFIX_SKIP_LIST`에서 거부됩니다 — sdk-example에 다른 Web API(`location.*`, `history.*` 등)의 데모 card가 추가되면 이 목록을 확장하세요. sdk-example 파일 casing이 `Capitalize(group) + 'Page.tsx'`와 다르면(예: `iap → IAPPage.tsx` 같은 약어 group), `SDK_PAGE_FILENAME_OVERRIDES`에 override를 추가합니다.

```bash
pnpm verify:crosslinks            # sdk-example에 없는 docs 메서드 → error
pnpm verify:crosslinks --strict   # 추가로: docs에 없는 sdk-example 메서드 → error
pnpm verify:crosslinks --ref <branch>  # main이 아닌 sdk-example ref로 검사
```

CI는 모든 PR에서 default 모드를 실행합니다(job: `verify-crosslinks`). 외부 fetch 실패(GitHub raw 다운, rate limit)는 기본적으로 경고하고 exit 0 — sdk-example 장애가 docs PR을 막아선 안 되기 때문입니다. 확실히 닫고 싶을 때는 로컬에서 `--strict`를 사용하세요.

## 배포

배포 URL: **`https://docs.aitc.dev/`** (전용 sub-domain).

- **워크플로**: [`.github/workflows/deploy-pages.yml`](./.github/workflows/deploy-pages.yml) — `main` push + `workflow_dispatch`. `pnpm build` → `actions/upload-pages-artifact@v3` → `actions/deploy-pages@v4`.
- **CI**: [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) — `check` job이 lint + typecheck + build dry-run을 돌리고, `verify-crosslinks` job이 `pnpm verify:crosslinks`를 실행.
- **버전 정책**: 없음. `main` = 배포 (Type C, Changesets 미사용).
- **Pages source**: repo Settings → Pages → "GitHub Actions" (이미 활성화됨).

## 로드맵

전체 SDK 네임스페이스의 API 레퍼런스가 ko/en으로 갖춰져 있습니다. 가이드(`guides/`)와 레시피(`recipes/`)를 채워 나가는 중입니다. 조직 전체 로드맵은 [landing page](https://aitc.dev/) 참고.

## 짝 repo

- [`sdk-example`](https://github.com/apps-in-toss-community/sdk-example) — downstream consumer. 각 API 페이지에서 sdk-example로 deep-link (`/docs/api/<group>/<method>` ↔ `/sdk-example/<group>#<method>`). 양방향 URL 계약은 `CLAUDE.md` 참고.

---

커뮤니티 오픈소스 프로젝트입니다.
