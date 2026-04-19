# TODO

## High Priority
- [ ] 다음 네임스페이스 작성: **`storage`** (SDK 호출 표면이 작고 의존성 없음 → 빠르게 두 번째 프로토타이핑 대상으로 적합). 이후 `haptic` → `navigation` 순.
- [ ] Guides/permissions-pattern 문서 작성 — 모든 API 페이지의 "권한" 섹션이 이 가이드를 역참조하도록 설계됨. 현재는 placeholder 문구만 있음. `clipboard`에 이어 `location`까지 두 네임스페이스가 같은 placeholder를 가리키므로 우선순위가 한 단계 올라감.

## Medium Priority
- [x] ~~실제 API 레퍼런스 페이지 작성~~ — `clipboard` 네임스페이스가 per-namespace 템플릿의 프로토타입으로 확립됨 (overview + 메서드 + ko/en mirror). `location` 네임스페이스가 eventful API(`startUpdateLocation`)와 enum 파라미터(`Accuracy`)에 대한 템플릿 변형까지 검증함. 남은 네임스페이스(auth, navigation, environment, permissions, storage, camera, contacts, haptic, iap, ads, game, analytics, partner, events)는 이 패턴을 따름.
- [ ] sdk-example → docs 방향 링크: `ApiCard`에 `docsUrl` 옵셔널 prop 추가 (sdk-example repo PR 별도)
- [ ] docs → sdk-example 방향 end-to-end 검증: `TryItLink`가 실제 sdk-example 배포로 열리는지, 앵커(`#<method>`) 지원이 ApiCard에 반영되는지 확인
- [ ] `scripts/verify-crosslinks.ts` 추가 — 양쪽 repo의 `<group>/<method>` 네이밍 1:1 매칭 CI 검증
- [ ] 영어(en) 전면 번역 — 현재는 `clipboard` 네임스페이스 전체와 `intro`만 존재

## Low Priority
- [ ] `pnpm.overrides`의 `webpack: 5.105.0` pin 제거 — webpackbar 6.0.2+ 릴리즈 후
- [ ] 로컬 검색 플러그인 설치 (`@easyops-cn/docusaurus-search-local`) — 1단계 검색
- [ ] Algolia DocSearch 신청 (커뮤니티 오픈소스 무료 등록 대상) — 문서 양이 의미 있게 커지면 로컬에서 DocSearch로 전환
- [ ] 다크모드 polish (커스텀 팔레트, 코드 블록 대비, 배너 색상)

## Performance
(None)

## Backlog
- [ ] Starlight 마이그레이션 검토 (Plan B) — Docusaurus webpack 빌드 시간/번들 크기가 운영상 문제가 되면 Astro + Starlight로 이식. IA가 단순 MDX 트리라 비용은 크지 않음.
