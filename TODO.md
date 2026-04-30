# TODO

## High Priority
- [x] ~~다음 네임스페이스 작성: **`storage`**~~ — overview + 4 메서드(getItem/setItem/removeItem/clearItems) ko/en 완성. 권한이 없는 네임스페이스의 첫 사례 — 권한 섹션이 permissions-pattern 가이드로 cross-link만 거는 패턴 확립. 다음은 `haptic` → `navigation` 순.
- [x] ~~Guides/permissions-pattern 문서 작성~~ — ko/en 양쪽 작성, 기존 placeholder(clipboard 2개 + location 2개)를 모두 새 가이드 링크로 교체. storage 페이지들도 같은 가이드를 cross-link.

## Medium Priority
- [x] ~~실제 API 레퍼런스 페이지 작성~~ — `clipboard` 네임스페이스가 per-namespace 템플릿의 프로토타입으로 확립됨 (overview + 메서드 + ko/en mirror). `location` 네임스페이스가 eventful API(`startUpdateLocation`)와 enum 파라미터(`Accuracy`)에 대한 템플릿 변형까지 검증함. 남은 네임스페이스(auth, navigation, environment, permissions, storage, camera, contacts, haptic, iap, ads, game, analytics, partner, events)는 이 패턴을 따름.
- [ ] sdk-example → docs 방향 링크: `ApiCard`에 `docsUrl` 옵셔널 prop 추가 (sdk-example repo PR 별도)
- [ ] docs → sdk-example 방향 end-to-end 검증: `TryItLink`가 실제 sdk-example 배포로 열리는지, 앵커(`#<method>`) 지원이 ApiCard에 반영되는지 확인
- [x] ~~`scripts/verify-crosslinks.ts` 추가 — 양쪽 repo의 `<group>/<method>` 네이밍 1:1 매칭 CI 검증~~ — sdk-example의 `src/pages/<Group>Page.tsx`를 GitHub raw로 받아 `name="..."` 프롭을 정적 추출. CI에서 `verify-crosslinks` job(이름 안정 → branch protection 등록 가능)으로 게이트. 외부 fetch 실패 시 기본은 warn + exit 0(sdk-example 다운으로 docs PR을 막지 않음), `--strict`는 fail closed.
- [ ] 영어(en) 전면 번역 — 현재는 `clipboard` 네임스페이스 전체와 `intro`만 존재

## Low Priority
- [x] ~~Migrate GitHub Pages to `docs.aitc.dev` custom domain~~ — done. `static/CNAME` lands at site root, `docusaurus.config.ts` `url`/`baseUrl` flipped to sub-domain root, all hard-coded `apps-in-toss-community.github.io` URLs flipped to the new domains (`aitc.dev` / `sdk-example.aitc.dev`), Cloudflare CNAME `docs → apps-in-toss-community.github.io` added, GitHub Pages custom domain set + HTTPS enforced.
- [ ] `pnpm.overrides`의 `webpack: 5.105.0` pin 제거 — webpackbar 6.0.2+ 릴리즈 후
- [ ] 로컬 검색 플러그인 설치 (`@easyops-cn/docusaurus-search-local`) — 1단계 검색
- [ ] Algolia DocSearch 신청 (커뮤니티 오픈소스 무료 등록 대상) — 문서 양이 의미 있게 커지면 로컬에서 DocSearch로 전환
- [ ] 다크모드 polish (커스텀 팔레트, 코드 블록 대비, 배너 색상)

## Performance
(None)

## Backlog
- [ ] Starlight 마이그레이션 검토 (Plan B) — Docusaurus webpack 빌드 시간/번들 크기가 운영상 문제가 되면 Astro + Starlight로 이식. IA가 단순 MDX 트리라 비용은 크지 않음.
