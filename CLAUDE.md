# CLAUDE.md

## 프로젝트 성격 (중요)

**`apps-in-toss-community`는 비공식(unofficial) 오픈소스 커뮤니티다.** 토스 팀과 제휴 없음. 사용자에게 보이는 산출물에서 "공식/official/토스가 제공하는/powered by Toss" 등 제휴·후원·인증 암시 표현을 **쓰지 않는다**. 대신 "커뮤니티/오픈소스/비공식"을 사용한다. 의심스러우면 빼라.

문서 특성상 앱인토스 공식 docs를 참조·인용하는 건 괜찮지만, 이 사이트 자체가 공식이라는 인상은 **절대 주지 않는다**. 상단 고정 배너 등으로 비공식 표시를 명시.

## 짝 repo

- **`sdk-example`** (downstream consumer) — 문서의 각 섹션은 sdk-example의 대응 페이지로 **deep-link**하고, sdk-example의 각 ApiCard는 이 문서로 링크. **한쪽 경로 구조가 바뀌면 반대쪽 링크가 깨진다** — path naming 변경은 양쪽 동시에. docs가 완성되면 sdk-example에서 각 API의 문서를 바로 읽어볼 수 있게 개선하는 것이 주요 통합 목표.
- **`agent-plugin`** — `/ait docs <topic>`이 이 문서의 마크다운 소스를 세션에 로드.

## 프로젝트 개요

**docs** — 앱인토스 공식 문서를 기반으로 재구성한 커뮤니티 가이드/레퍼런스. "세련되고 친절한" 정보 아키텍처, 검색, 예제 통합이 목표.

기술 스택은 결정 전 (Docusaurus / Nextra / VitePress 후보).

## 기술 스택

- **Docusaurus 3** (classic preset, TypeScript, MDX)
- **pnpm** — 패키지 매니저 (10.33.0)
- **Biome** — lint + formatter (조직 표준). `*.md`/`*.mdx`는 Biome에서 제외 — MDX 파서/Docusaurus 컨벤션을 따른다.
- **Changesets 사용 안 함** — Type C (사이트). `main` = 배포.

프레임워크 선정 근거와 정보 아키텍처 전체는 [`PLAN.md`](./PLAN.md) 참고.

## i18n

- 기본 로케일: `ko` (한국어) — 콘텐츠는 `docs/` 루트
- 추가 로케일: `en` — 콘텐츠는 `i18n/en/docusaurus-plugin-content-docs/current/`
- 새 페이지를 추가할 때는 **ko 먼저**, 필요 시 en mirror를 같은 경로에 추가.

## sdk-example 딥링크

- URL 규칙: `/docs/api/<group>/<method>`
- `<group>`은 sdk-example의 route segment(소문자), `<method>`는 SDK export 이름(카멜케이스).
- 링크 생성은 `src/components/TryItLink.tsx`를 사용.
- 경로/네이밍 변경 시 반드시 sdk-example과 동시 변경 (양쪽 CLAUDE.md 규칙).

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

## Status

초기 스캐폴드 완료. 실제 문서 콘텐츠 채우기는 후속 PR.

전체 로드맵은 [landing page](https://apps-in-toss-community.github.io/) 참고.
