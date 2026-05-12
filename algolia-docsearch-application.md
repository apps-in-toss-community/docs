# Algolia DocSearch Application Spec

> **Status**: Spec 완성, 신청 자체는 Dave manual step.
> **작성일**: 2026-05-12
> **신청 URL**: https://dashboard.algolia.com/users/sign_up?selected_plan=docsearch

---

## 1. 현재 문서 분량

| 구분 | 파일 수 |
|---|---|
| ko (기본, `docs/`) | 27 페이지 (.md / .mdx) |
| en (번역, `i18n/en/`) | 28 페이지 (.md / .mdx) |
| **총합** | **55 파일** |

### 완성된 네임스페이스 (5개)

| 네임스페이스 | 페이지 구성 |
|---|---|
| `clipboard` | overview + getClipboardText + setClipboardText |
| `haptic` | overview + generateHapticFeedback + saveBase64Data |
| `location` | overview + getCurrentLocation + startUpdateLocation |
| `navigation` | overview + closeView + getTossShareLink + openURL + requestReview + setDeviceOrientation + setIosSwipeGestureEnabled + setScreenAwakeMode + setSecureScreen + share |
| `storage` | overview + clearItems + getItem + removeItem + setItem |

그 외: `intro`, `guides/permissions-pattern`, `reference/glossary` (ko/en 각각)

### 평가

현재 27 ko 페이지는 DocSearch 신청 최소 기준(technical documentation, public, open-source)을 충족하기에 분량상 무리가 없다. Algolia DocSearch는 명시적 최소 페이지 수 요건을 두지 않으며 "technical docs or blog" 여부만 본다. 나머지 15개 네임스페이스(인증·IAP·광고·카메라·연락처·게임·분석·파트너 등)가 추가되면 170+ 페이지로 성장 예정 — 신청을 지금 해도 무방하고 콘텐츠가 늘수록 검색 가치도 커진다.

---

## 2. Algolia DocSearch 자격 조건

출처: https://docsearch.algolia.com/docs/who-can-apply, https://docsearch.algolia.com/docs/docsearch-program (2026-05-12 확인)

### 충족 조건 (체크리스트)

| 조건 | 이 프로젝트 | 비고 |
|---|---|---|
| Technical documentation 또는 technical blog | **충족** | 앱인토스 SDK API 레퍼런스 |
| 공개(public) 사이트 | **충족** | https://docs.aitc.dev/ (GitHub Pages) |
| Production-ready | **충족** | GitHub Pages 배포 완료, CNAME 적용 |
| 오픈소스 프로젝트 | **충족** | https://github.com/apps-in-toss-community/docs (public repo) |
| "Search by Algolia" 배지 표시 동의 | **수용 가능** | DocSearch 전환 시 추가 예정 |
| 도메인 소유권 7일 내 인증 | **수용 가능** | Dave가 Cloudflare에서 운영 |

### 제외 사유 해당 없음

- 비기술(non-technical) 콘텐츠 아님
- Production-ready 미달 아님
- 비공개/private 사이트 아님

---

## 3. 신청서 작성 가이드

신청 URL: **https://dashboard.algolia.com/users/sign_up?selected_plan=docsearch**

Algolia 계정 생성(또는 로그인) 후 DocSearch 플랜 선택. 아래 필드를 미리 준비한다.

| 필드 | 입력값 | 비고 |
|---|---|---|
| Documentation URL | `https://docs.aitc.dev/` | 실제 배포된 사이트 URL |
| Project name | `Apps In Toss Community (AITC) Docs` | GitHub org 풀네임 병기 |
| Project description | "Unofficial community-maintained API reference and guides for Apps In Toss (앱인토스) mini-app SDK. Open-source, not affiliated with Toss." | 비공식 커뮤니티 명시 필수 — "unofficial community" 표현 포함 |
| GitHub repository | `https://github.com/apps-in-toss-community/docs` | public repo |
| Email | dave@elyvian.io | 승인 결과 수신 |
| Framework | Docusaurus | Algolia가 Docusaurus 공식 지원 — 자동 크롤러 설정 가능 |

### 주의 사항

- **"unofficial community"를 프로젝트 설명에 반드시 포함**. 토스/앱인토스와의 제휴·공식 관계를 암시하는 문구 금지.
- 승인 후 Algolia 대시보드에서 크롤러 설정. Docusaurus v3는 `@docsearch/react` + `themeConfig.algolia` 블록으로 통합.
- DocSearch 전환 전까지 현행 `@easyops-cn/docusaurus-search-local` 유지.

---

## 4. 승인 후 Docusaurus 통합 절차 (요약)

1. Algolia 대시보드에서 `appId`, `apiKey` (Search-only), `indexName` 수령
2. `docusaurus.config.ts` `themeConfig.algolia` 블록 추가:
   ```ts
   algolia: {
     appId: 'YOUR_APP_ID',
     apiKey: 'YOUR_SEARCH_API_KEY',  // search-only key
     indexName: 'YOUR_INDEX_NAME',
     contextualSearch: true,
     searchParameters: {},
   }
   ```
3. `@easyops-cn/docusaurus-search-local` 플러그인 및 관련 패키지 제거
4. `pnpm build` 확인 후 PR 오픈

참고: https://docsearch.algolia.com/docs/docsearch-v3 (Docusaurus 공식 통합 가이드)

---

## 5. 결정 기준 — "의미 있게 커지면"

현재 27 ko 페이지는 신청 가능 수준이나, **로컬 검색으로도 충분**한 규모다. 아래 시점 중 하나에서 신청 진행을 권장한다.

- 네임스페이스 8개 이상 완성 (현재 5/20)
- 또는 getting-started / guides 섹션 본격 작성 후
- 또는 `docs.aitc.dev` 외부 트래픽이 발생하기 시작할 때 (analytics 확인)

---

*이 문서는 신청서 spec만 작성한 것이며, 신청 제출 자체는 Dave가 직접 진행해야 한다.*
