# docs

> 🚧 **Work in Progress** — 아직 개발 중입니다. 사이트는 아직 배포되지 않았습니다.

**Apps in Toss** 미니앱 개발을 위한 커뮤니티 문서 사이트. 앱인토스 공식 문서를 기반으로 재구성한 **가이드/레퍼런스** 세트입니다.

> ⚠️ **비공식 커뮤니티 프로젝트 (Unofficial community project)** — 이 사이트는 토스(Toss) 또는 앱인토스 팀과 제휴 관계가 없으며, 공식 문서가 아닙니다. 커뮤니티가 자발적으로 만들고 유지합니다.

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
```

## Pre-commit hook

선택 사항이지만 권장합니다. clone 후 다음 한 줄로 표준 pre-commit hook을 활성화하세요 (staged 파일에 `biome check` 실행):

```sh
git config core.hooksPath .githooks
```

push 전 빠른 피드백을 위한 개발자 편의 기능입니다. CI가 동일한 검사를 실제 강제 계층으로 실행하므로, hook을 활성화하지 않은 contributor도 PR 단계에서 lint 실패를 확인하게 됩니다.

## Deploy

GitHub Pages (`https://apps-in-toss-community.github.io/docs/`)로 자동 배포. 조직 루트 사이트(`apps-in-toss-community.github.io`)가 이미 있으므로 이 repo는 **서브패스 배포** (`baseUrl: '/docs/'`).

- 트리거: `main` 브랜치 push
- 워크플로: `.github/workflows/deploy-pages.yml`
- CI(`.github/workflows/ci.yml`)는 lint + typecheck + build의 dry-run 역할.

## Roadmap

현재 스캐폴드 완료 단계. 남은 작업은 [`TODO.md`](./TODO.md) 참고.

조직 전체 로드맵은 [landing page](https://apps-in-toss-community.github.io/) 참고.

## Pair repos

- [`sdk-example`](https://github.com/apps-in-toss-community/sdk-example) — downstream consumer. 각 API 페이지에서 sdk-example로 deep-link (`/docs/api/<group>/<method>` ↔ `/sdk-example/<group>#<method>`). 양방향 URL 계약은 `CLAUDE.md` 참고.
