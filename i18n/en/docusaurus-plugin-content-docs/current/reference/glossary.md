---
id: glossary
title: Glossary (ko↔en)
sidebar_label: Glossary
slug: /reference/glossary
description: Term mapping used consistently across the Korean and English pages on this site.
---

# Glossary (ko↔en)

This site runs Korean as the default locale and English as a secondary mirror. When the same concept gets translated differently between two pages, the docs drift quickly. Use the terms in this table verbatim when writing new pages or translating existing ones.

:::info Scope
This table covers terms in the **mini-app / Toss host environment / permissions and storage SDK** domain only. Standard Web APIs, general front-end terminology, and OS-level wording are not policed — prefer the natural English phrasing as long as the meaning is unambiguous.
:::

## SDK / host environment

| Korean | English | Notes |
| --- | --- | --- |
| 미니앱 | mini-app | Hyphenated. Do not use `miniapp` or `mini app`. |
| 호스트 앱 | host app | Refers to the Toss app itself. |
| 호스트 환경 | host environment | The in-app webview context the mini-app runs in. |
| 인앱 webview | in-app webview | The webview embedded inside the Toss app. |
| SDK | SDK | Initialism kept as-is. Refers to `@apps-in-toss/web-framework`. |
| 네임스페이스 | namespace | API groups like `clipboard`, `location`, `storage`. |
| 시그니처 | signature | TypeScript function-type declaration. Lives under the **`## 시그니처` / `## Signature`** H2 heading. |
| 콜백 | callback | Function arguments like `onEvent`, `onError`. |
| 구독 해제 함수 | unsubscribe function | The `() => void` returned by `startUpdateLocation`. |

## Permissions

| Korean | English | Notes |
| --- | --- | --- |
| 권한 | permission | Identifiers inside API names — `getPermission`, `openPermissionDialog`, `PermissionName` — stay as-is. |
| 권한 요청 | permission request | The act of asking the user. |
| 권한 다이얼로그 | permission dialog | The OS-rendered system dialog. |
| 권한 거절 | denied | A `PermissionStatus` literal — keep the English token inside code. |
| 권한 미결정 | notDetermined | Same. |
| 권한 승인 | allowed | Same. |
| 권한 등급 | access tier | Steps like `accessLocation: 'FINE' \| 'COARSE'`. |

## Storage / clipboard

| Korean | English | Notes |
| --- | --- | --- |
| 저장소 | storage | The SDK `Storage` namespace, Web `localStorage`, and similar general usage. |
| 키-값 저장소 | key-value store | One hyphen. Do not write `key value store`. |
| 클립보드 | clipboard | The system clipboard. |
| 직렬화 / 역직렬화 | serialize / deserialize | The `JSON.stringify` / `JSON.parse` round-trip. |

## Location

| Korean | English | Notes |
| --- | --- | --- |
| 위치 | location | The SDK namespace name and the everyday noun both. |
| 정확도 | accuracy | Either the `Accuracy` enum or the coordinate error radius. Code identifiers stay as-is. |
| 좌표 | coordinates | The plain-language form of the `coords` object. |
| 백그라운드 추적 | background tracking | Location updates that continue after the app leaves the foreground. |

## Site identity / policy

| Korean | English | Notes |
| --- | --- | --- |
| 비공식 커뮤니티 | unofficial community | "공식 / official / powered by Toss" is banned. |
| 커뮤니티 프로젝트 | community project | How the `apps-in-toss-community` organization refers to itself. |
| 공식 문서 | official docs | Only when *citing* the Apps-in-Toss project's own docs. Never apply it to this site. |

## Standard H2 headings used by the page template

| Korean | English |
| --- | --- |
| 시그니처 | Signature |
| 파라미터 | Parameters |
| 반환값 | Returns |
| 권한 | Permission |
| 예제 | Examples |
| 직접 실행해 보기 | Try it live |
| 관련 API | Related APIs |
| 관련 가이드 | Related guides |
| 외부 참조 | External references |

The canonical English heading is **`External references`**. The word `Upstream` is not used in user-visible copy — for references to `@apps-in-toss/web-framework`, write "SDK package" or "published release" instead.

## Out of scope

- Standard Web API terms (e.g., `Permissions API`, `localStorage`) follow MDN spelling verbatim.
- General IT vocabulary (e.g., `webview`, `cache`, `quota`) is not translated.
- Toss-branded product names (Toss, Toss Securities, etc.) keep their original spelling in user-facing copy.

When a new term comes up, add it here before writing the page that needs it. Prefer collapsing duplicates over letting the same concept appear in two rows.
