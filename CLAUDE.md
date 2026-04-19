# CLAUDE.md

## 프로젝트 성격 (중요)

**`apps-in-toss-community`는 비공식(unofficial) 오픈소스 커뮤니티다.** 토스 팀과 제휴 없음. 사용자에게 보이는 산출물에서 "공식/official/토스가 제공하는/powered by Toss" 등 제휴·후원·인증 암시 표현을 **쓰지 않는다**. 대신 "커뮤니티/오픈소스/비공식"을 사용한다. 의심스러우면 빼라.

문서 특성상 앱인토스 공식 docs를 참조·인용하는 건 괜찮지만, **이 사이트 자체가 공식이라는 인상은 절대 주지 않는다**. 루트 레이아웃에 "비공식 커뮤니티 프로젝트" 배너를 상시 고정.

## 프로젝트 개요

**docs** — 앱인토스 공식 문서를 기반으로 재구성한 커뮤니티 가이드/레퍼런스. "세련되고 친절한" 정보 아키텍처, 검색, 예제 통합이 목표.

## 프레임워크 선택 근거

### 후보

| 항목 | Docusaurus 3 | Nextra 3/4 | VitePress 1.x | Starlight (Astro 5) |
|---|---|---|---|---|
| 기반 | React + MDX + webpack | Next.js + MDX | Vue + Vite | Astro + MDX (islands) |
| i18n (ko/en) | **1급** (locale별 콘텐츠 트리, crowdin 표준 흐름) | Next 라우팅 기반, MDX 수동 분기 | 1급 | 1급 |
| 검색 | Algolia / 로컬 플러그인 | 로컬 / Algolia | 로컬 내장 | **Pagefind 내장** |
| 결과물 크기 (static) | 중간 (React 런타임) | 중간~큼 (Next 런타임) | 작음 | **가장 작음 (zero-JS default)** |
| 조직 스택 정합성 | **React 주류 — 높음** | React (Next SSR 추가) | Vue — 낮음 | Astro — island 경계 의식 |
| sdk-example 컴포넌트 재사용 | React 공유 쉬움 | React 공유 쉬움 | Vue — 어려움 | island 번들링 주의 |
| GitHub Pages 배포 | `baseUrl` 한 줄 | `next export` + basePath | `base` + `outDir` | `base` + static out |

### 결론: Docusaurus 3 채택

1. **i18n 성숙도가 가장 높다.** `docusaurus write-translations`와 `i18n/<locale>/docusaurus-plugin-content-docs/current/` 트리가 명확. 한국어 default + 영어 secondary 요구에 정확히 맞음.
2. **React 스택 정렬.** sdk-example/homepage/devtools가 모두 React. docs에서 sdk-example의 `ApiCard` 같은 인터랙티브 요소를 재사용하거나, 공용 React 컴포넌트(`InfoBanner`, "Unofficial" 배지 등)를 뽑기 용이.
3. **GitHub Pages 배포가 단순.** `url` + `baseUrl` 두 필드로 끝. homepage와 동일한 Pages workflow 재사용 가능.
4. **트레이드오프**: Starlight가 더 가볍고 Pagefind 내장이 매력적이지만 (a) 조직에 Astro 경험 없음, (b) sdk-example React 컴포넌트 재사용 시 island 경계를 매번 의식해야 함. 도구 다양성은 비용.
5. **Plan B로 Starlight 보존.** webpack 빌드 시간/번들 크기가 문제되면 MDX 트리째 이식 가능 (TODO.md backlog).

## 정보 아키텍처 (IA)

```
/docs/
├── intro                         # Landing (비공식 배너 + 사이트 소개)
├── getting-started/
│   ├── what-is-apps-in-toss
│   ├── quickstart                # devtools로 5분 미니앱
│   ├── project-setup
│   └── first-deploy
├── guides/                       # "왜/언제" 중심
│   ├── auth-flow
│   ├── iap-workflow
│   ├── permissions-pattern
│   ├── events-subscription
│   └── ads-integration
├── api/                          # "무엇/어떻게" 레퍼런스
│   ├── auth/, navigation/, environment/, permissions/, storage/,
│   ├── location/, camera/, contacts/, clipboard/, haptic/,
│   └── iap/, ads/, game/, analytics/, partner/, events/
├── recipes/                      # 복사-붙여넣기 스니펫
└── reference/
    ├── changelog
    ├── community-projects        # 조직 repo 소개
    └── glossary
```

### API 페이지 템플릿 (`/docs/api/<group>/<method>`)

각 페이지는 아래 섹션을 동일한 순서로 제공한다:

1. 제목 (`<method>`)
2. 한 줄 요약
3. 비공식 안내 배지 (`:::info 비공식 문서`)
4. 설명 — 어디서 언제 쓰는지, 제약, 플랫폼 가용성
5. 시그니처 (`ts` 코드 블록, `declare function ...`)
6. 파라미터 표 (name / type / required / description). 파라미터가 없으면 "없음."
7. 반환값 / 이벤트 (eventful API의 경우 콜백 시퀀스). 특이 사항(빈 문자열 의미 등)은 `:::caution`으로 강조.
8. **권한** — 해당 API가 요구하는 `PermissionName`을 명시. SDK의 함수 객체에 부착된 `.getPermission()` / `.openPermissionDialog()` 유틸을 예시 코드로 보여줌. Guides의 "권한 처리 패턴" 문서로 역참조(현재는 placeholder).
9. 예제 — 최소 예제 + 실전 예제 (`tsx` 선호)
10. **Try it** — sdk-example의 해당 ApiCard로 deep-link (`<TryItLink group method />`)
11. 관련 API — 같은 네임스페이스 내 다른 메서드로 상대경로 링크 (`./otherMethod`)
12. 관련 가이드 — `/docs/guides/*`로 역링크
13. 외부 참조 — `@apps-in-toss/web-framework` npm, 앱인토스 공식 문서 앵커

### 네임스페이스 overview 페이지 (`/docs/api/<group>/index.mdx`)

네임스페이스에 **2개 이상의 메서드**가 있으면 overview 페이지를 만든다.

- frontmatter에 `slug: /api/<group>`, `id: <group>-overview` 고정 (id가 `index`면 Docusaurus가 헷갈려함)
- 구성: 네임스페이스 소개 → 메서드 표 → 공유되는 권한/제약 → UX 가이드 → Try it 링크 → 외부 참조
- **주의**: overview의 `slug`를 덮어쓰면 상대경로(`./setClipboardText`)가 `/api/setClipboardText`로 잘못 resolve 된다. overview 페이지 안에서는 메서드 링크를 **절대경로**(`/api/<group>/<method>`)로 쓸 것. 메서드 페이지끼리는 상대경로가 정상 동작.
- sidebar 진입 라벨은 `Overview`.

## sdk-example deep-link 컨벤션 (URL 안정성)

### docs → sdk-example

- 경로 규칙: `/docs/api/<group>/<method>`
  - `<group>`: sdk-example 페이지 이름과 동일한 **소문자 단수형** (`clipboard`, `navigation`, `iap`, `ads`)
  - `<method>`: SDK export 이름과 동일한 **카멜케이스 원형** (`setClipboardText`, `appLogin`)
- Try it 버튼 타겟 (현재 `TryItLink`가 emit하는 URL):
  - prod: `https://apps-in-toss-community.github.io/sdk-example/<group>#<method>`
  - dev: `http://localhost:5173/<group>#<method>`
- 앵커(`#<method>`)는 **현재 sdk-example에서 무시되지만 URL 계약에 이미 포함**. sdk-example `ApiCard`가 `anchor` prop을 받도록 확장되면(후속 PR) 자동으로 스크롤/하이라이트가 동작하므로, docs 링크는 바꿀 필요 없음.
- 링크 생성은 `src/components/TryItLink.tsx` 사용.

### sdk-example → docs

- 각 `ApiCard`에 `docsUrl` 옵셔널 prop (sdk-example PR 별도).
- URL: `https://apps-in-toss-community.github.io/docs/api/<group>/<method>`

### 네이밍 동기화 책임

- `docs`의 `sidebars.ts`가 `<group>` 목록의 source of truth.
- sdk-example의 `pages/XxxPage.tsx` 이름 변경 시 **동시에** sidebar 엔트리도 변경.
- **한쪽 경로 구조가 바뀌면 반대쪽 링크가 깨진다.** path naming 변경은 양쪽 동시에 PR.
- 추후 `scripts/verify-crosslinks.ts`로 CI 자동 검증.

## webpack 5.105.0 pin 근거

`package.json`의 `pnpm.overrides`에 `webpack: 5.105.0` 고정. Docusaurus 3.10이 의존하는 `webpackbar` 6.0.1이 webpack 5.106+의 내부 API 변경과 호환되지 않아 빌드가 터지는 문제 회피용.

**제거 조건**: `webpackbar` 6.0.2+ 릴리즈 (호환 수정). 릴리즈 확인 후 override 제거, `pnpm install`로 최신 webpack으로 복구. TODO.md Low Priority에 트래킹.

## 배포 전략

**Type C (사이트)** — Changesets 사용 안 함. `main` = 배포.

- 타깃: GitHub Pages → `https://apps-in-toss-community.github.io/docs/`
- 서브패스 배포 (`baseUrl: '/docs/'`) — 조직 루트 사이트가 이미 있으므로.
- Pages 환경: Settings → Pages → Source: GitHub Actions.
- 워크플로: `.github/workflows/deploy-pages.yml`
  - 트리거: `push` to `main`, `workflow_dispatch`
  - 스텝: checkout → pnpm/action-setup → setup-node (.nvmrc) → `pnpm install` → `pnpm build` → `configure-pages` → `upload-pages-artifact build/` → `deploy-pages`
- CI(`.github/workflows/ci.yml`): `pnpm lint` + `pnpm typecheck` + `pnpm build` dry-run.
- 버전/릴리즈 개념 없음. 의미 있는 마일스톤은 수동 GitHub Release 정도 권장.

## i18n

- 기본 로케일: `ko` (한국어) — 콘텐츠는 `docs/` 루트
- 추가 로케일: `en` — 콘텐츠는 `i18n/en/docusaurus-plugin-content-docs/current/`
- 라우팅: `/docs/` → 한국어, `/docs/en/` → 영어
- 새 페이지는 **ko 먼저**, 필요 시 en mirror를 같은 경로에 추가.
- 초기 스캐폴드에서 ko/en 모두 최소 1페이지(`clipboard/setClipboardText`)를 작성해 파이프라인 동작 증명.

## 짝 repo

- **`sdk-example`** (downstream consumer) — 문서의 각 섹션은 sdk-example의 대응 페이지로 **deep-link**, sdk-example의 각 ApiCard는 이 문서로 역링크. 양방향. 위 "sdk-example deep-link 컨벤션" 참조. docs가 완성되면 sdk-example에서 각 API의 문서를 바로 읽어볼 수 있게 개선하는 것이 주요 통합 목표.
- **`agent-plugin`** — `/ait docs <topic>`이 이 문서의 마크다운 소스를 세션에 로드.

## 명령어

```bash
pnpm dev         # Docusaurus dev (http://localhost:3000)
pnpm build       # build/ 에 정적 생성
pnpm serve       # 빌드 결과 로컬 미리보기
pnpm typecheck   # tsc --noEmit
pnpm lint        # biome check .
pnpm lint:fix    # biome check --write .
pnpm format      # biome format --write .
```

## 코드/콘텐츠 규칙

- 모든 사용자 가시 콘텐츠에서 "공식/official/powered by Toss" 등 금지.
- Biome 포맷·린트는 `docusaurus.config.ts`, `sidebars.ts`, 커스텀 React 소스에 적용. `.docusaurus/`, `build/`, `.vercel/` 무시.
- `*.md`/`*.mdx`는 Biome 제외 — MDX 파서/Docusaurus 컨벤션 따름.
- `any` 금지 (조직 표준 승계, `biome.json`).

## Status

`clipboard` 네임스페이스(overview + `setClipboardText` + `getClipboardText`, ko/en) 완성 — per-namespace 템플릿 프로토타입으로 확립됨. 나머지 15개 네임스페이스는 이 패턴을 복제. 다음 우선순위와 backlog은 TODO.md 참고.
