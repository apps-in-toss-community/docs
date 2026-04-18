# TODO

## High Priority
(None)

## Medium Priority
- [ ] 실제 API 레퍼런스 페이지 작성 (SDK namespace별: auth, navigation, environment, permissions, storage, location, camera, contacts, clipboard, haptic, iap, ads, game, analytics, partner, events)
- [ ] sdk-example deep-link 계약 end-to-end 검증 — `docs → sdk-example` (TryItLink) + `sdk-example → docs` (ApiCard `docsUrl` prop) 양방향 동작 확인, `scripts/verify-crosslinks.ts` 추가

## Low Priority
- [ ] `pnpm.overrides`의 `webpack: 5.105.0` pin 제거 — webpackbar 6.0.2+ 릴리즈 후
- [ ] Algolia DocSearch 신청 (커뮤니티 오픈소스 무료 등록 대상) — 로컬 검색 플러그인에서 전환
- [ ] 다크모드 polish (커스텀 팔레트, 코드 블록 대비, 배너 색상)

## Performance
(None)

## Backlog
- [ ] Starlight 마이그레이션 검토 (Plan B) — Docusaurus webpack 빌드 시간/번들 크기가 운영상 문제가 되면 Astro + Starlight로 이식. IA가 단순 MDX 트리라 비용은 크지 않음.
