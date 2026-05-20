---
image: /og/reference-glossary.png
id: glossary
title: 용어 사전 (한↔영)
sidebar_label: 용어 사전
slug: /reference/glossary
description: 본 사이트의 한국어/영어 페이지에서 일관되게 쓰는 용어 매핑.
---

# 용어 사전 (한↔영)

이 사이트는 한국어를 기본 로케일, 영어를 보조 로케일로 운영합니다. 같은 개념이 두 페이지에서 다른 단어로 번역되면 문서가 빠르게 흔들립니다. 새로운 페이지를 쓰거나 기존 페이지를 번역할 때는 아래 표의 용어를 그대로 쓰세요.

:::info 적용 범위
이 표는 **앱인토스 미니앱 / 토스 호스트 환경 / 권한·저장소 SDK** 맥락의 용어만 다룹니다. 표준 Web API, 일반 프런트엔드, OS 용어는 굳이 강제하지 않습니다 — 의미가 흔들리지 않는 한 자연스러운 영어 표현을 우선합니다.
:::

## SDK / 호스트 환경

| 한국어 | English | 비고 |
| --- | --- | --- |
| 미니앱 | mini-app | 하이픈으로 연결. `miniapp` / `mini app` 금지. |
| 호스트 앱 | host app | 토스 앱 자체를 가리킬 때. |
| 호스트 환경 | host environment | 미니앱이 실행되는 인앱 webview 컨텍스트. |
| 인앱 webview | in-app webview | 토스 앱 내부의 webview. |
| SDK | SDK | 줄임말 그대로. `@apps-in-toss/web-framework`을 가리킵니다. |
| 네임스페이스 | namespace | `clipboard`, `location`, `storage` 같은 API 그룹. |
| 시그니처 | signature | TypeScript 함수 타입 선언. 페이지의 **`## 시그니처` / `## Signature`** H2 헤딩. |
| 콜백 | callback | `onEvent`, `onError`의 함수 인자. |
| 구독 해제 함수 | unsubscribe function | `startUpdateLocation`이 반환하는 `() => void`. |

## 권한 (Permissions)

| 한국어 | English | 비고 |
| --- | --- | --- |
| 권한 | permission | API 이름 안의 `getPermission` / `openPermissionDialog` / `PermissionName`은 식별자라 그대로 유지. |
| 권한 요청 | permission request | 사용자에게 묻는 행위 자체. |
| 권한 다이얼로그 | permission dialog | OS가 띄우는 시스템 다이얼로그. |
| 권한 거절 | denied | `PermissionStatus` 값이라 코드 문맥에서는 영문 그대로. |
| 권한 미결정 | notDetermined | 동일. |
| 권한 승인 | allowed | 동일. |
| 권한 등급 | access tier | `accessLocation: 'FINE' \| 'COARSE'` 같은 단계. |

## 저장소 / 클립보드

| 한국어 | English | 비고 |
| --- | --- | --- |
| 저장소 | storage | SDK `Storage` 네임스페이스 / Web `localStorage` 등 일반 명사. |
| 키-값 저장소 | key-value store | 하이픈 한 개. `key value store` 금지. |
| 클립보드 | clipboard | 시스템 클립보드. |
| 직렬화 / 역직렬화 | serialize / deserialize | `JSON.stringify` / `JSON.parse` 흐름. |

## 위치 (Location)

| 한국어 | English | 비고 |
| --- | --- | --- |
| 위치 | location | SDK 네임스페이스 이름이자 일반 명사. |
| 정확도 | accuracy | `Accuracy` enum이나 좌표 오차 반경. 코드 식별자는 그대로. |
| 좌표 | coordinates | `coords` 객체의 사람-말 표현. |
| 백그라운드 추적 | background tracking | 앱이 포그라운드를 벗어난 상태의 위치 갱신. |

## 사이트 정체성 / 정책

| 한국어 | English | 비고 |
| --- | --- | --- |
| 커뮤니티 프로젝트 | community project | `apps-in-toss-community` 조직 전반의 자기 호칭. "공식 / official / powered by Toss / 비공식 / unofficial"은 모두 쓰지 않습니다. |
| 공식 문서 | official docs | 앱인토스 측 공식 docs를 *참조*할 때만. 이 사이트 자체에는 쓰지 않습니다. |

## 페이지 템플릿의 표준 H2 헤딩

| 한국어 | English |
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

영어 표준 헤딩은 **`External references`**. `Upstream`이라는 단어는 사용자 가시 영역에 쓰지 않습니다 (`@apps-in-toss/web-framework`을 가리킬 때는 "SDK package" / "published release" 등으로).

## 적용되지 않는 영역

- 표준 Web API 용어 (예: `Permissions API`, `localStorage`)는 MDN 표기를 그대로 따릅니다.
- 일반 IT 용어 (예: `webview`, `cache`, `quota`)는 굳이 한국어로 옮기지 않습니다.
- 토스 제품 라인업(토스, 토스증권 등 브랜드 이름)은 외부 노출 문맥에서 정확한 원어 표기를 유지합니다.

새 용어가 필요해지면 이 표에 먼저 추가한 뒤 페이지를 작성하세요. 같은 개념이 표에 두 번 등장하지 않도록 합치는 것을 우선합니다.
