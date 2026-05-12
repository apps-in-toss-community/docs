// biome-ignore lint/correctness/noUnusedImports: React must be in scope for JSX (satori uses React.createElement)
import React from 'react';

/**
 * Static OG image template (1200x630) for docs.aitc.dev.
 *
 * Adapts the shared AITC brand design (mirroring homepage src/og/template.tsx)
 * for per-page docs use. Displays a namespace eyebrow (e.g. "clipboard") and
 * the page title (e.g. "setClipboardText").
 *
 * satori only supports a subset of CSS — flex layout, no grid. Keep
 * positioning explicit (every node with multiple children has display: 'flex').
 */

interface OgTemplateProps {
  /** Uppercase label shown above the title — namespace name or "Docs" for overview */
  eyebrow: string;
  /** Main heading — method name or namespace name */
  title: string;
  /** One-line description pulled from frontmatter */
  subtitle: string;
  /** Bottom footer line — always "docs.aitc.dev" */
  footer: string;
}

const COLORS = {
  bg: '#f4f5f7',
  brand: '#3182f6',
  fg: '#191f28',
  fgSoft: '#4e5968',
  fgMuted: '#8b95a1',
  white: '#ffffff',
};

export function OgTemplate({ eyebrow, title, subtitle, footer }: OgTemplateProps) {
  return (
    <div
      style={{
        width: 1200,
        height: 630,
        display: 'flex',
        flexDirection: 'row',
        background: COLORS.bg,
        padding: '96px',
        alignItems: 'center',
        gap: '44px',
        fontFamily: 'Pretendard',
      }}
    >
      {/* Brand badge */}
      <div
        style={{
          width: 280,
          height: 280,
          borderRadius: 56,
          background: COLORS.brand,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            color: COLORS.white,
            fontSize: 110,
            fontWeight: 800,
            letterSpacing: '-3px',
          }}
        >
          AITC
        </div>
      </div>

      {/* Text content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minWidth: 0,
        }}
      >
        {/* Eyebrow (namespace) */}
        <div
          style={{
            color: COLORS.brand,
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: '2px',
            textTransform: 'uppercase',
          }}
        >
          {eyebrow}
        </div>

        {/* Title (method or namespace) */}
        <div
          style={{
            color: COLORS.fg,
            fontSize: 52,
            fontWeight: 800,
            letterSpacing: '-2px',
            marginTop: 18,
            lineHeight: 1.1,
          }}
        >
          {title}
        </div>

        {/* Subtitle (description) */}
        <div
          style={{
            color: COLORS.fgSoft,
            fontSize: 30,
            fontWeight: 500,
            letterSpacing: '-0.5px',
            marginTop: 22,
            lineHeight: 1.35,
          }}
        >
          {subtitle}
        </div>

        {/* Footer */}
        <div
          style={{
            color: COLORS.fgMuted,
            fontSize: 22,
            fontWeight: 500,
            marginTop: 28,
          }}
        >
          {footer}
        </div>
      </div>
    </div>
  );
}
