# docs — 초기 스캐폴드 계획 (PLAN)

> 이 문서는 `@ait-co/docs` 사이트의 **프레임워크 선정 근거**와 **정보 아키텍처**, **sdk-example과의 딥링크 계약**, **배포 전략**을 기록한다. 구현은 이 PR의 나머지 파일에서 진행한다.

## 1. 프레임워크 선정

### 후보 비교

| 항목 | Docusaurus 3 | Nextra 3/4 | VitePress 1.x | Starlight (Astro 5) |
|---|---|---|---|---|
| 기반 | React + MDX + webpack/Rspack | Next.js + MDX | Vue + Vite + Markdown | Astro + MDX (framework-agnostic islands) |
| i18n (ko/en) | **1급** (`i18n.locales`, 분리된 콘텐츠 트리, locale별 번역 JSON) | Next.js 라우팅 기반 (`i18n` config + 디렉토리 prefix) — MDX 콘텐츠 수동 분기 | **1급** (`locales` config, 디렉토리 prefix, 자동 lang switcher) | **1급** (`locales` config, 루트 경로 / locale 경로 선택, Astro 특화) |
| 다크모드 | 기본 | 기본 | 기본 | 기본 |
| 검색 | Algolia DocSearch / 로컬 플러그인 | 로컬(플래그) / Algolia | **로컬 내장** / Algolia | **Pagefind 내장(zero-config)** / Algolia |
| 라이브 데모 embedding | MDX + React 자유 | MDX + React 자유 | Vue 컴포넌트 중심 (React는 어댑터 필요) | MDX + React/Vue/Svelte island |
| GitHub Pages 배포 | `baseUrl` + `deploy` 간단 | `next export` + basePath 설정 필요 | `base` + `outDir` | `base` + 단순 static out |
| 결과물 크기 (static) | 중간 (React 런타임 포함) | 중간~큼 (Next 런타임) | 작음 | **가장 작음 (zero-JS by default)** |
| 조직 기술 스택 정합성 | **React + Vite 주류 — 정합성 높음** | React (Next SSR 추가) | Vue — 정합성 낮음 | Astro — framework-agnostic, React island 사용 가능 |
| sdk-example 딥링크·재사용 | React 컴포넌트 공유 가능 | React 컴포넌트 공유 가능 | Vue — 재사용 어려움 | React island 가능하나 번들링 경계 주의 |
| 성숙도·커뮤니티 | 매우 큼 | 큼 | 큼 | 중간 (빠르게 성장) |

### 결론: **Docusaurus 3** 채택

근거:

1. **i18n이 가장 성숙**하다. `docusaurus write-translations`와 locale별 `i18n/<locale>/docusaurus-plugin-content-docs/current/` 트리가 명확하고, crowdin 연동까지 표준 흐름이 있다. 이 사이트는 **한국어가 default, 영어가 secondary**라는 요구에 정확히 맞는다.
2. **조직 스택과 정합**: sdk-example/homepage/devtools가 모두 React 기반. 향후 docs에서 sdk-example의 `ApiCard` 같은 인터랙티브 요소를 재사용하거나, 공용 React 컴포넌트(예: `InfoBanner`, "Unofficial" 배지)를 뽑아 올리기 용이.
3. **GitHub Pages 배포가 가장 단순**. `docusaurus.config.ts`의 `url` + `baseUrl` 두 필드로 끝. 우리의 homepage(`apps-in-toss-community.github.io`)와 동일한 Pages 워크플로를 재사용 가능.
4. **장점의 트레이드오프**: Starlight가 기술적으로 더 가볍고 Pagefind 내장이 매력적이지만, (a) Astro는 조직에서 지금까지 쓰지 않아 러닝커브가 있고, (b) sdk-example React 컴포넌트 재사용을 위해서는 island 경계를 매번 의식해야 한다. 도구 다양성은 비용이다.
5. **검색은 1단계에서 로컬 검색 플러그인**(`@easyops-cn/docusaurus-search-local`)을 붙이고, 문서 양이 의미 있게 커지면 Algolia DocSearch를 신청한다. 커뮤니티 오픈소스 프로젝트는 DocSearch 무료 등록 대상.

> Starlight는 **플랜 B**. 만약 초기 운영 중 Docusaurus의 webpack 빌드 시간이나 번들 크기가 운영상 문제가 되면, IA(아래)가 단순한 MDX 파일 트리라 이식 비용은 크지 않다.

## 2. 정보 아키텍처 (IA)

### 최상위 섹션

```
/docs/
├── intro                         # Landing (비공식 배너 + 사이트 소개 + 빠른 링크)
├── getting-started/
│   ├── what-is-apps-in-toss      # 앱인토스란 무엇인가 (커뮤니티 요약)
│   ├── quickstart                # devtools로 브라우저 미니앱 만들기 5분 가이드
│   ├── project-setup             # pnpm/vite/devtools 설정
│   └── first-deploy              # console-cli(추후) 또는 수동 배포
├── guides/                       # "왜/언제" 중심의 실전 가이드
│   ├── auth-flow
│   ├── iap-workflow
│   ├── permissions-pattern
│   ├── events-subscription
│   └── ads-integration
├── api/                          # "무엇/어떻게" API 레퍼런스
│   ├── auth/appLogin, getUserKeyForGame, ...
│   ├── navigation/closeView, openURL, share, ...
│   ├── environment/getPlatformOS, SafeAreaInsets, ...
│   ├── permissions/getPermission, requestPermission
│   ├── storage/setItem, getItem, ...
│   ├── location/getCurrentLocation, startUpdateLocation
│   ├── camera/openCamera, fetchAlbumPhotos
│   ├── contacts/fetchContacts
│   ├── clipboard/getClipboardText, setClipboardText
│   ├── haptic/generateHapticFeedback, saveBase64Data
│   ├── iap/...
│   ├── ads/...
│   ├── game/...
│   ├── analytics/...
│   ├── partner/...
│   └── events/...
├── recipes/                      # 복사-붙여넣기 지향 스니펫
│   └── (guides와 연결. 예: "구매 플로우 전체 예시")
└── reference/
    ├── changelog
    ├── community-projects        # 조직 내 repo 소개 (devtools, sdk-example, polyfill, ...)
    └── glossary
```

### 페이지 구조 (API 레퍼런스 템플릿)

각 `/docs/api/<group>/<method>` 페이지는 아래 섹션을 **동일한 순서**로 제공한다:

1. **제목** (`<method>`)
2. **한 줄 요약**
3. **비공식 안내 배지** (global admonition — 사이트 레벨로 상시)
4. **설명** — 어디서 언제 쓰는지, 제약, 플랫폼 가용성
5. **시그니처** (`tsx` 코드 블록)
6. **파라미터 표** (name / type / required / description)
7. **반환값 / 이벤트** (eventful API의 경우 콜백 시퀀스)
8. **예제** — 최소 예제 + 실전 예제
9. **try it** — sdk-example의 해당 ApiCard로 **deep-link 버튼**
10. **관련 가이드** — `/docs/guides/*`로 역링크
11. **외부 참조** — `@apps-in-toss/web-framework` npm, 앱인토스 공식 문서 앵커

## 3. sdk-example 딥링크 계약 (URL 안정성)

### docs → sdk-example 방향

- docs API 페이지 경로 규칙: `/docs/api/<group>/<method>`
  - `<group>`은 sdk-example의 페이지 이름과 **동일한 소문자 단수형**을 사용한다
    (e.g., `clipboard`, `navigation`, `iap`, `ads`)
  - `<method>`는 SDK의 export 이름과 동일한 **카멜케이스 원형**
    (e.g., `setClipboardText`, `appLogin`)
- "Try it" 버튼 타겟:
  - 배포판: `https://apps-in-toss-community.github.io/sdk-example/<group>`
  - 로컬 개발: `http://localhost:5173/<group>`
- 장기 목표: sdk-example의 `ApiCard`가 `anchor`를 받도록 확장해 특정 메서드 카드로 스크롤/하이라이트
  (`/<group>#<method>`). 이 PR 범위에는 포함하지 않되, 링크 포맷은 미리 `/<group>#<method>`로 기록해 두면 나중에 자동으로 동작한다.

### sdk-example → docs 방향

- 각 `ApiCard`에 `docsUrl` 옵셔널 prop 추가 (sdk-example PR 별도 예정).
- URL: `https://apps-in-toss-community.github.io/docs/api/<group>/<method>`
- `group`/`method` 쌍은 파일명으로 1:1 매칭되므로, 양쪽 repo가 같은 네이밍을 쓰면 **링크 검증을 CI로 자동화** 가능 (`scripts/verify-crosslinks.ts` — 나중에 추가).

### 네이밍 동기화 책임

- `docs`의 `sidebars.ts`가 `<group>` 목록의 source of truth.
- sdk-example의 `pages/XxxPage.tsx` 이름을 바꿀 때는 **동시에** 이 sidebar 엔트리도 바꾼다.
- 두 레포 모두 CLAUDE.md에서 이 계약을 상기시킨다.

## 4. i18n 전략

- **기본 로케일**: `ko` (한국어)
- **추가 로케일**: `en` (영어)
- 라우팅:
  - `/docs/` → 한국어 (기본)
  - `/docs/en/` → 영어
- 콘텐츠 트리:
  - 기본(ko): `docs/` (Docusaurus `docs` 플러그인의 기본 경로)
  - en: `i18n/en/docusaurus-plugin-content-docs/current/`
- 초기 PR에서는 **ko와 en 모두 최소 1페이지(clipboard)**를 작성해 파이프라인이 실제로 동작함을 증명한다. 나머지 페이지는 이후 PR.

## 5. 배포

- **타깃**: GitHub Pages → `https://apps-in-toss-community.github.io/docs/`
- 조직 사이트(`apps-in-toss-community.github.io`)가 이미 루트를 차지하고 있으므로, 이 repo는 **서브패스 배포**. `docusaurus.config.ts`에 `baseUrl: '/docs/'`.
- Pages 환경: "Deploy from GitHub Actions" 활성화 (리포 Settings → Pages → Source: GitHub Actions).
- 워크플로: `.github/workflows/deploy-pages.yml`
  - 트리거: `push` to `main`, `workflow_dispatch`
  - 스텝: checkout → pnpm/action-setup → setup-node (.nvmrc) → `pnpm install` → `pnpm build` → `configure-pages` → `upload-pages-artifact build/` → `deploy-pages`
- CI(`.github/workflows/ci.yml`)는 `pnpm lint` + `pnpm typecheck` + `pnpm build`를 수행하되 아직 배포는 하지 않는 dry-run 역할.

## 6. 로컬 개발

```bash
pnpm install
pnpm dev          # http://localhost:3000 (Docusaurus 기본)
pnpm build        # build/ 에 정적 생성
pnpm serve        # 빌드 결과 로컬 미리보기
pnpm typecheck    # tsc --noEmit
pnpm lint         # biome check .
pnpm lint:fix     # biome check --write .
pnpm format       # biome format --write .
```

## 7. 코드/콘텐츠 규칙

- 모든 사용자 가시 콘텐츠에서 **"공식/official/powered by Toss"** 등 토스와의 제휴·후원·인증을 암시하는 표현 금지. 루트 레이아웃에 **"비공식 커뮤니티 프로젝트"** 배너를 상시 고정.
- Biome의 포맷·린트는 `docusaurus.config.ts`, `sidebars.ts` 및 커스텀 React 소스에 적용. `.docusaurus/`, `build/`, `.vercel/`은 무시.
- MDX 콘텐츠 내부의 코드 포맷(예: `tsx` 코드 블록)은 Biome가 직접 건드리지 않는다 (Docusaurus/MDX 파서의 컨벤션을 따른다).
- **`any` 금지**는 조직 표준을 그대로 승계 (`biome.json`).

## 8. 이 PR의 범위 (Out of scope 명시)

이 PR은 **스캐폴드 + 예시 1개** 범위.

포함:
- Docusaurus 3 설치 + pnpm + TypeScript 설정
- 랜딩 페이지(한국어) + "비공식" 배너
- API 예시 페이지 1개: `docs/api/clipboard/setClipboardText.md` (+ 영어 미러)
- sdk-example 딥링크 버튼 컴포넌트 (`src/components/TryItLink.tsx`)
- `docusaurus.config.ts` (baseUrl, i18n, URL, organizationName 등)
- `sidebars.ts` 초기 뼈대
- `pnpm dev/build/typecheck/lint/format` 동작
- GitHub Actions: `ci.yml`(기존) 교체/확장 + `deploy-pages.yml` 신규

미포함 (후속 PR):
- 나머지 15개 API 도메인의 전체 페이지
- 검색 플러그인 설치 및 튜닝
- sdk-example 쪽 `docsUrl` prop 추가 (해당 repo PR)
- crosslink 검증 스크립트
- 영어 번역 전면(일단 1페이지만)
