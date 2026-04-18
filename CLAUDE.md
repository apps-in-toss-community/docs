# CLAUDE.md

## 프로젝트 성격 (중요)

**`apps-in-toss-community`는 비공식(unofficial) 오픈소스 커뮤니티다.** 토스 팀과 제휴 없음. 사용자에게 보이는 산출물에서 "공식/official/토스가 제공하는/powered by Toss" 등 제휴·후원·인증 암시 표현을 **쓰지 않는다**. 대신 "커뮤니티/오픈소스/비공식"을 사용한다. 의심스러우면 빼라.

문서 특성상 앱인토스 공식 docs를 참조·인용하는 건 괜찮지만, 이 사이트 자체가 공식이라는 인상은 **절대 주지 않는다**. 상단 고정 배너 등으로 비공식 표시를 명시.

## 짝 repo

- **`sdk-example`** — 문서의 각 섹션은 sdk-example의 대응 페이지로 **deep-link**하고, sdk-example의 각 ApiCard는 이 문서로 링크. **한쪽 경로 구조가 바뀌면 반대쪽 링크가 깨진다** — path naming 변경은 양쪽 동시에.
- **`agent-plugin`** — `/ait docs <topic>`이 이 문서의 마크다운 소스를 세션에 로드.

## 프로젝트 개요

**docs** — 앱인토스 공식 문서를 기반으로 재구성한 커뮤니티 가이드/레퍼런스. "세련되고 친절한" 정보 아키텍처, 검색, 예제 통합이 목표.

기술 스택은 결정 전 (Docusaurus / Nextra / VitePress 후보).

## Status

placeholder 상태. 기술 스택 선정 전.

전체 로드맵은 [landing page](https://apps-in-toss-community.github.io/) 참고.
