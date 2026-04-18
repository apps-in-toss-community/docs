# TODO

## High Priority
(None)

## Medium Priority
- [ ] 실제 API 레퍼런스 페이지 작성 (SDK namespace별: auth, navigation, environment, permissions, storage, location, camera, contacts, clipboard, haptic, iap, ads, game, analytics, partner, events)
- [ ] sdk-example → docs 방향 링크: `ApiCard`에 `docsUrl` 옵셔널 prop 추가 (sdk-example repo PR 별도)
- [ ] docs → sdk-example 방향 end-to-end 검증: `TryItLink`가 실제 sdk-example 배포로 열리는지, 앵커(`#<method>`) 지원이 ApiCard에 반영되는지 확인
- [ ] `scripts/verify-crosslinks.ts` 추가 — 양쪽 repo의 `<group>/<method>` 네이밍 1:1 매칭 CI 검증
- [ ] 영어(en) 전면 번역 — 현재는 파이프라인 증명용 1페이지(`clipboard/setClipboardText`)만 존재

## Low Priority
- [ ] `pnpm.overrides`의 `webpack: 5.105.0` pin 제거 — webpackbar 6.0.2+ 릴리즈 후
- [ ] 로컬 검색 플러그인 설치 (`@easyops-cn/docusaurus-search-local`) — 1단계 검색
- [ ] Algolia DocSearch 신청 (커뮤니티 오픈소스 무료 등록 대상) — 문서 양이 의미 있게 커지면 로컬에서 DocSearch로 전환
- [ ] 다크모드 polish (커스텀 팔레트, 코드 블록 대비, 배너 색상)

## Performance
(None)

## Backlog
- [ ] Starlight 마이그레이션 검토 (Plan B) — Docusaurus webpack 빌드 시간/번들 크기가 운영상 문제가 되면 Astro + Starlight로 이식. IA가 단순 MDX 트리라 비용은 크지 않음.
