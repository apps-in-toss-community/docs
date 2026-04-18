# docs

> 🚧 **Work in Progress** — site not yet deployed.
> 아직 개발 중입니다. 사이트는 아직 배포되지 않았습니다.

Curated documentation for building [Apps in Toss](https://toss.im/) mini-apps.

공식 문서를 기반으로 하되, 더 세련되고 친절한 **가이드/레퍼런스 문서 세트**.

## Goal / 목표

- **Getting started**: 처음부터 미니앱 하나 배포까지의 실전 가이드
- **Recipes**: 흔한 시나리오(IAP, Ads, Permissions 등)의 실전 코드
- **API reference**: 원본 SDK 레퍼런스를 더 읽기 쉽게 재구성
- **한국어 + English** 양쪽 제공

Will be published to `https://apps-in-toss-community.github.io/docs/` once ready.

## Status

Initial scaffold landed. The framework is **Docusaurus 3** (rationale in [`PLAN.md`](./PLAN.md)). Only the landing page and one sample API page (`setClipboardText`) are written so far — the rest of the reference is a follow-up.

See the [organization landing page](https://apps-in-toss-community.github.io/) for the full roadmap.

## Local development

```bash
pnpm install
pnpm dev          # http://localhost:3000 by default
pnpm build        # static output in build/
pnpm serve        # preview the built site
pnpm typecheck    # tsc --noEmit
pnpm lint         # biome check .
```

## Architecture

- Framework: Docusaurus 3 (`@docusaurus/preset-classic`)
- Korean is the default locale; English lives under `i18n/en/`
- Deploys to `https://apps-in-toss-community.github.io/docs/` via GitHub Pages Action
- Deep-link contract with [`sdk-example`](https://github.com/apps-in-toss-community/sdk-example) is documented in `PLAN.md` §3. The helper component is `src/components/TryItLink.tsx`.
