/**
 * Swizzle wrapper for DocItem/Layout.
 *
 * Injects JSON-LD structured data into every API doc page:
 *   - TechArticle — per-page schema (name, description, url, inLanguage, image, author)
 *   - BreadcrumbList — multi-item breadcrumb: site root → namespace → method
 *
 * Strategy: wrap (not eject). The original DocItemLayout is rendered unchanged;
 * this wrapper only prepends a <Head> block with the JSON-LD <script> tags.
 *
 * Refs:
 *   https://schema.org/TechArticle
 *   https://schema.org/BreadcrumbList
 *   https://docusaurus.io/docs/swizzling#wrapper-your-site-with-root
 */

import Head from '@docusaurus/Head';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import { useLocation } from '@docusaurus/router';
import type { Props } from '@theme/DocItem/Layout';
import DocItemLayout from '@theme-original/DocItem/Layout';
import type { ReactNode } from 'react';

const SITE_URL = 'https://docs.aitc.dev';
const SITE_NAME = 'Apps in Toss Community Docs';
const AUTHOR_NAME = 'Apps in Toss Community';

/** Returns the inLanguage value based on the current URL path. */
function useInLanguage(): string {
  const { pathname } = useLocation();
  return pathname.startsWith('/en/') ? 'en' : 'ko';
}

/**
 * Derive a multi-item BreadcrumbList from the current path and doc title.
 * Example path: /api/clipboard/setClipboardText
 *   Item 1: site root   → https://docs.aitc.dev
 *   Item 2: namespace   → https://docs.aitc.dev/api/clipboard
 *   Item 3: method page → https://docs.aitc.dev/api/clipboard/setClipboardText
 */
function buildBreadcrumbList(pathname: string, docTitle: string): object | null {
  // Strip trailing slash, normalise
  const clean = pathname.replace(/\/$/, '');
  const parts = clean.split('/').filter(Boolean);

  // We only emit enhanced breadcrumbs for /api/<namespace>[/<method>] pages.
  // For other pages (intro, guides, etc.) we let the default Docusaurus breadcrumb handle it.
  const apiIndex = parts.indexOf('api');
  if (apiIndex === -1 || parts.length < apiIndex + 2) return null;

  const namespace = parts[apiIndex + 1];
  const isMethod = parts.length > apiIndex + 2;
  const method = isMethod ? parts[apiIndex + 2] : null;

  const items: Array<{ '@type': string; position: number; name: string; item: string }> = [
    {
      '@type': 'ListItem',
      position: 1,
      name: SITE_NAME,
      item: SITE_URL,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: namespace,
      item: `${SITE_URL}/api/${namespace}`,
    },
  ];

  if (method) {
    items.push({
      '@type': 'ListItem',
      position: 3,
      name: docTitle,
      item: `${SITE_URL}${clean}`,
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}

function DocItemJsonLd(): ReactNode {
  const { metadata, frontMatter } = useDoc();
  const { pathname } = useLocation();
  const inLanguage = useInLanguage();

  const canonicalUrl = `${SITE_URL}${pathname.replace(/\/$/, '')}`;

  // frontMatter is typed as Record<string, unknown> in Docusaurus
  const fm = frontMatter as Record<string, unknown>;
  const title = (fm.title as string | undefined) ?? metadata.title ?? '';
  const description = (fm.description as string | undefined) ?? metadata.description ?? '';
  const ogImage = typeof fm.image === 'string' ? `${SITE_URL}${fm.image}` : undefined;

  const techArticle: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    name: title,
    headline: title,
    url: canonicalUrl,
    inLanguage,
    author: {
      '@type': 'Organization',
      name: AUTHOR_NAME,
      url: SITE_URL,
    },
  };
  if (description) techArticle.description = description;
  if (ogImage) techArticle.image = ogImage;

  const breadcrumb = buildBreadcrumbList(pathname, title);

  return (
    <Head>
      <script type="application/ld+json">{JSON.stringify(techArticle)}</script>
      {breadcrumb && <script type="application/ld+json">{JSON.stringify(breadcrumb)}</script>}
    </Head>
  );
}

export default function DocItemLayoutWrapper(props: Props): ReactNode {
  return (
    <>
      <DocItemJsonLd />
      <DocItemLayout {...props} />
    </>
  );
}
