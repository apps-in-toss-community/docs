# CLAUDE.md

## 프로젝트 성격

`apps-in-toss-community`는 토스/앱인토스 팀과 제휴 관계가 없는 커뮤니티 프로젝트다. 사용자에게 보이는 모든 산출물(문서 본문, UI 카피, 패키지 설명, 커밋/PR 메시지, 코드 주석 등)에서 "공식(official)", "토스가 제공하는", "앱인토스에서 만든", "powered by Toss" 같은 제휴·후원·인증 암시 표현은 **금지**. 대신 "커뮤니티(community)" 같은 자연스러운 표현. 의심스러우면 뺀다.

문서 특성상 앱인토스 공식 docs를 참조·인용하는 건 괜찮지만 이 사이트 자체가 공식이라는 인상은 주지 않는다.

**톤 가이드** (방어적 disclaimer 금지): README와 사이트 모두에서 정책 명시는 차분한 1회 — 한국어 primary 자연스러운 한 줄(예: `커뮤니티 오픈소스 프로젝트입니다.`). "제휴 아님" 같은 방어적 표현 대신 "커뮤니티 오픈소스" 정체성만 자연스럽게. 헤더 직후의 `>` blockquote 박스, ⚠️ 아이콘, 굵은 글씨, `unofficial`/`비공식` 같은 강한 라벨, 영/한 병기는 모두 쓰지 않는다.

## 프로젝트 개요

**docs** — 앱인토스 공식 문서를 기반으로 재구성한 커뮤니티 가이드/레퍼런스. "세련되고 친절한" 정보 아키텍처, 검색, 예제 통합이 목표.

## 프레임워크: Docusaurus 3 채택 근거

후보(Docusaurus 3 / Nextra / VitePress / Starlight) 중 **Docusaurus 3** 선택. 결정 요인:

1. **i18n 성숙도가 가장 높다.** `i18n/<locale>/docusaurus-plugin-content-docs/current/` 트리. 한국어 default + 영어 secondary에 정확히 맞음.
2. **React 스택 정렬.** sdk-example/homepage/devtools가 모두 React. `ApiCard` 등 컴포넌트 공유 용이.
3. **GitHub Pages 배포 단순.** `url` + `baseUrl` 두 필드로 끝.
4. **Starlight는 Plan B.** Pagefind 내장 검색·작은 번들이 매력적이지만 (a) 조직에 Astro 경험 없음 (b) sdk-example React 컴포넌트 재사용 시 island 경계를 매번 의식해야 함. 거부가 아니라 보류 — webpack 빌드 시간/번들이 문제되면 MDX 트리째 이식 가능.

## 정보 아키텍처 (IA)

```
/docs/
├── intro.md                      # Landing (사이트 소개 + 푸터 disclaimer 1회)
├── guides/                       # "왜/언제" — auth-flow, iap-workflow, permissions-pattern, events-subscription, ads-integration
├── api/                          # "무엇/어떻게" 레퍼런스 — auth, navigation, environment, permissions, storage,
│                                 #   location, camera, contacts, clipboard, haptic, iap, ads, game, analytics, partner, events
├── recipes/                      # 복사-붙여넣기 스니펫
└── reference/                    # glossary
```

### API 페이지 템플릿 (`/docs/api/<group>/<method>`)

각 페이지는 다음 순서로 구성: (1) 제목 (2) 한 줄 요약 (3) 설명 — 어디서 언제, 제약, 플랫폼 가용성 (4) 시그니처 (`ts` `declare function ...`) (5) 파라미터 표 (name/type/required/description; 없으면 "없음.") (6) 반환값/이벤트 — 특이 사항은 `:::caution` (7) **권한** — `PermissionName` 명시 + `.getPermission()`/`.openPermissionDialog()` 예시, Guides "권한 처리 패턴" 역참조(현재 placeholder) (8) 예제 — 최소 + 실전 (`tsx` 선호) (9) **직접 실행해 보기** (en: "Try it live") — `<TryItLink group method />` (10) 관련 API — 같은 네임스페이스 내 메서드로 상대경로 (11) 관련 가이드 — 미작성은 `_(작성 예정)_ Guides — "<제목>"` placeholder (en: `_(coming soon)_ Guides — "<title>"`) (12) 외부 참조 — npm + 앱인토스 공식 docs 앵커. 영어 표준 헤딩 **"External references"**. "Upstream" 사용 금지.

페이지마다 별도 disclaimer 배지를 붙이지 않는다. 사이트 정체성은 `intro.md`/en intro 푸터의 차분한 한 줄(`커뮤니티 오픈소스 프로젝트입니다.` / `Community open-source project.`)에서 1회 명시한다 — 위 "프로젝트 성격"의 톤 가이드 참조.

예시 코드에서 `showToast`처럼 **SDK에 실제로 존재하지 않는 API를 import하지 않는다**. 사용자 피드백은 앱 자체 토스트(`showAppToast(...)`) 또는 `setState` 인라인 메시지로. 새 SDK import 추가 시 `../devtools/src/mock/device/` 또는 `@apps-in-toss/webview-bridge` 타입에 실재 여부 먼저 확인.

### 네임스페이스 overview 페이지 (`/docs/api/<group>/index.mdx`)

메서드 2개 이상이면 overview 작성. frontmatter `slug: /api/<group>`, `id: <group>-overview` 고정 (id가 `index`면 Docusaurus 혼동). 구성: 소개 → 메서드 표 → 공유 권한/제약 → UX 가이드 → Try it 링크 → 외부 참조.

- **주의**: overview의 `slug` 덮어쓰기 때문에 **메서드 링크는 절대경로** (`/api/<group>/<method>`). 메서드 페이지끼리는 상대경로 정상 동작.
- sidebar 진입 라벨은 `Overview`. Try it은 `<TryItLink group="<group>" />` (method 생략).
- **메서드 순서**: sidebar와 overview 표 모두 **SDK export 이름 기준 알파벳순** 동일 정렬 (sidebar가 source of truth).

## sdk-example deep-link 컨벤션 (URL 안정성)

**docs → sdk-example**:
- 경로 `/docs/api/<group>/<method>` — `<group>`은 sdk-example 페이지명과 동일한 **소문자 단수형** (`clipboard`, `navigation`, `iap`, `ads`), `<method>`는 SDK export와 동일한 **카멜케이스 원형**.
- Try it 타겟: prod `https://sdk-example.aitc.dev/<group>#<method>`, dev `http://localhost:5173/<group>#<method>`.
- 앵커는 현재 sdk-example에서 무시되지만 URL 계약에 포함됨 (`ApiCard`가 `anchor` prop을 받는 후속 PR에서 자동 동작).
- 링크 생성은 `src/components/TryItLink.tsx`.

**sdk-example → docs**: 각 `ApiCard`에 `docsUrl` 옵셔널 prop (sdk-example PR 별도). URL `https://docs.aitc.dev/api/<group>/<method>`.

**네이밍 동기화**: `sidebars.ts`가 `<group>` 목록의 source of truth. sdk-example의 `pages/XxxPage.tsx` 이름 변경 시 sidebar 엔트리도 동시 변경. **한쪽이 바뀌면 반대쪽 링크가 깨진다** — path naming 변경은 양쪽 동시 PR. `scripts/verify-crosslinks.ts`가 CI 검증.

## 배포 전략 (Type C: 사이트, Changesets 없음)

이 repo는 **Type C(서비스/사이트)** — npm 배포 없음, Changesets 없음, `main` push가 곧 배포.

- 타깃: GitHub Pages custom domain → `https://docs.aitc.dev/`. 전용 sub-domain이라 `baseUrl: '/'`.
- `static/CNAME`에 `docs.aitc.dev` 한 줄 — Docusaurus가 `static/`을 `build/`로 verbatim 복사.
- Pages: Settings → Pages → Source: GitHub Actions.
- 워크플로 `.github/workflows/deploy-pages.yml`: push to `main` + `workflow_dispatch` → checkout → pnpm/action-setup → setup-node (.nvmrc) → `pnpm install` → `pnpm build` → `configure-pages` → `upload-pages-artifact build/` → `deploy-pages`.
- CI(`.github/workflows/ci.yml`): `pnpm lint` + `pnpm typecheck` + `pnpm build` dry-run.

## i18n

기본 로케일 `ko` (콘텐츠는 `docs/` 루트), 추가 `en` (`i18n/en/docusaurus-plugin-content-docs/current/`). 라우팅: `/docs/` → ko, `/docs/en/` → en. **새 페이지는 ko 먼저**, 필요 시 en mirror를 같은 경로에. 초기 스캐폴드는 ko/en 모두 `clipboard/setClipboardText`로 파이프라인 동작 증명.

## 명령어

```bash
pnpm dev              # Docusaurus dev (http://localhost:3000)
pnpm build            # build/ 정적 생성
pnpm serve            # 빌드 결과 로컬 미리보기
pnpm typecheck        # tsc --noEmit
pnpm lint             # biome check .
pnpm lint:fix         # biome check --write .
pnpm format           # biome format --write .
pnpm verify:crosslinks  # sdk-example↔docs 경로 계약 검증 (CI 게이트)
pnpm coverage:check   # SDK 커버리지 검증
pnpm coverage:baseline  # SDK 커버리지 기준선 갱신
```

전체 목록은 package.json scripts 참조.

## 공통 스택

- **Node 24 LTS**, **pnpm 10.33.0** (`packageManager` 고정), **TypeScript strict**.
- **Biome** (lint + formatter). ESLint/Prettier 사용 안 함. `any` 금지 (`suspicious.noExplicitAny: error`).
- Biome 적용 범위: `docusaurus.config.ts`, `sidebars.ts`, 커스텀 React 소스. `.docusaurus/`, `build/`, `.vercel/` 무시. `*.md`/`*.mdx`는 Biome 제외 (MDX 파서/Docusaurus 컨벤션 따름).
- **Pre-commit hook**: `.githooks/pre-commit`이 source-controlled. contributor가 수동 활성화:
  ```bash
  git config core.hooksPath .githooks
  ```
  CI `pnpm lint`가 실제 강제 계층, hook은 빠른 피드백.
- **Commit message**: Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`).

## 코드/콘텐츠 규칙

- 사용자 가시 콘텐츠에서 "공식/official/powered by Toss" 등 금지 ("프로젝트 성격" 섹션 참조).
- "공통 스택" 섹션의 규칙(Biome 적용 범위, `any` 금지) 준수.

## 짝 repo

- **`sdk-example`** — 양방향 deep-link. 위 "sdk-example deep-link 컨벤션" 참조. docs가 완성되면 sdk-example에서 각 API의 문서를 바로 읽어볼 수 있게 개선하는 것이 주요 통합 목표.

## Status

18개 API 네임스페이스(ads, analytics, auth, camera, clipboard, contacts, environment, events, game, haptic, iap, location, navigation, notification, partner, payment, permissions, storage)가 ko/en 양쪽으로 작성됨 — overview + per-method 페이지. `guides/`(14편)와 `recipes/`(27편)도 채워져 `docs.aitc.dev`에 배포 중. `clipboard`가 per-namespace 템플릿 프로토타입이었고 나머지는 이 패턴을 복제했다. 남은 작업은 guides/recipes 추가 보강과 가이드 역참조 placeholder 해소.

## 이슈/제안

이슈/제안은 GitHub Issues로 (`apps-in-toss-community/docs`).
