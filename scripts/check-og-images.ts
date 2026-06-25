// ---------------------------------------------------------------------------
// OG 카드 PNG 존재 검증 (CI 게이트)
//
// 각 docs/i18n MDX 가 frontmatter `image: /og/<x>.png` 를 선언하면 그에 대응하는
// static/og/<x>.png 가 실재해야 한다. 페이지를 추가·작성하면서 `pnpm build:og`
// 를 빠뜨리면 OG 카드가 404 가 된다(#107·#105·#108 → #112 로 누적된 정확한 사고).
//
// 왜 byte-equality 가 아니라 존재만 검사하나:
//   build:og(satori + resvg)는 같은 입력이라도 macOS 와 Linux 에서 래스터화
//   바이트가 다르다(폰트는 src/og/fonts 로 커밋돼 있어도 rasterizer 가 플랫폼
//   의존). 커밋된 PNG 는 작성자 머신(macOS) 산출물이라 CI(Linux)가 재생성하면
//   거의 전부 differ → `git diff --exit-code` 는 모든 PR 에서 오탐(false fail).
//   따라서 "stale 텍스트"(#106 류)는 가드 범위 밖으로 두고, 더 흔하고 치명적인
//   "PNG 누락"(404 카드) 만 결정적으로 막는다. 존재 검사는 플랫폼 무관하게
//   안정적이다.
//
// 로컬에서 새 페이지 추가 시: `pnpm build:og` 로 PNG 생성 후 커밋하면 통과.
// ---------------------------------------------------------------------------

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const STATIC_OG = join(ROOT, 'static');
// frontmatter `image:` 가 가리키는 콘텐츠 트리. ko 본문(docs/) + en 미러(i18n/).
const CONTENT_DIRS = [join(ROOT, 'docs'), join(ROOT, 'i18n')];

const IMAGE_RE = /^image:\s*(\S+)\s*$/m;

/** 디렉토리 트리에서 .md/.mdx 파일 경로를 모두 수집한다. */
function collectMarkdown(dir: string): string[] {
  const out: string[] = [];
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return out; // 트리 부재(예: i18n 미설정)는 무시
  }
  for (const name of entries) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...collectMarkdown(full));
    } else if (name.endsWith('.md') || name.endsWith('.mdx')) {
      out.push(full);
    }
  }
  return out;
}

/** frontmatter 블록(`--- ... ---`)에서 image: 값을 추출한다. 없으면 null. */
function extractImage(source: string): string | null {
  const fm = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) return null;
  const m = fm[1].match(IMAGE_RE);
  if (!m) return null;
  return m[1].replace(/^['"]|['"]$/g, '');
}

function main(): void {
  const files = CONTENT_DIRS.flatMap(collectMarkdown);
  const missing: { file: string; image: string; expected: string }[] = [];
  let declared = 0;

  for (const file of files) {
    const image = extractImage(readFileSync(file, 'utf8'));
    if (!image) continue; // image: 미선언 페이지는 검사 대상 아님
    declared++;
    // `/og/<x>.png` → static/og/<x>.png (Docusaurus 가 static/ 을 verbatim serve)
    const rel = image.replace(/^\//, '');
    const expected = join(STATIC_OG, rel);
    try {
      statSync(expected);
    } catch {
      missing.push({ file: file.replace(`${ROOT}/`, ''), image, expected: `static/${rel}` });
    }
  }

  if (missing.length > 0) {
    console.error(
      `\n[og] ${missing.length}개 페이지의 OG 카드 PNG 가 누락됐습니다 — 로컬에서 'pnpm build:og' 실행 후 커밋하세요:\n`,
    );
    for (const m of missing) {
      console.error(`  ✗ ${m.file}`);
      console.error(`      image: ${m.image}  →  ${m.expected} (없음)`);
    }
    console.error('');
    process.exit(1);
  }

  console.log(`[og] OK — image: 선언 ${declared}개 페이지 전부 대응 PNG 존재.`);
}

main();
