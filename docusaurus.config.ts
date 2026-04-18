import type * as Preset from '@docusaurus/preset-classic';
import type { Config } from '@docusaurus/types';
import { themes as prismThemes } from 'prism-react-renderer';

const GITHUB_ORG = 'apps-in-toss-community';
const REPO = 'docs';

const config: Config = {
  title: 'Apps in Toss — Community Docs',
  tagline: '커뮤니티가 정리한 앱인토스 미니앱 가이드·레퍼런스 (비공식)',
  favicon: 'img/logo.svg',

  // Target URL. The homepage owns the org root, so docs lives at /docs/.
  url: `https://${GITHUB_ORG}.github.io`,
  baseUrl: '/docs/',

  organizationName: GITHUB_ORG,
  projectName: REPO,

  // Fail loud on bad links during build so broken xrefs are caught in CI.
  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  // Korean first, English second.
  i18n: {
    defaultLocale: 'ko',
    locales: ['ko', 'en'],
    localeConfigs: {
      ko: { label: '한국어', direction: 'ltr' },
      en: { label: 'English', direction: 'ltr' },
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          editUrl: `https://github.com/${GITHUB_ORG}/${REPO}/edit/main/`,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
    announcementBar: {
      id: 'unofficial-community-notice',
      content:
        '이 사이트는 <strong>비공식 커뮤니티 프로젝트</strong>입니다. 토스(Toss) 팀과 제휴되어 있지 않습니다. / This is an <strong>unofficial community project</strong>, not affiliated with Toss.',
      backgroundColor: '#fff7e0',
      textColor: '#5c4400',
      isCloseable: false,
    },
    navbar: {
      title: 'Apps in Toss Community',
      logo: {
        alt: 'Apps in Toss Community',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
        {
          href: 'https://apps-in-toss-community.github.io/',
          label: 'Home',
          position: 'right',
        },
        {
          href: `https://github.com/${GITHUB_ORG}/${REPO}`,
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Community',
          items: [
            {
              label: 'Landing',
              href: 'https://apps-in-toss-community.github.io/',
            },
            {
              label: 'sdk-example',
              href: 'https://apps-in-toss-community.github.io/sdk-example/',
            },
            {
              label: 'devtools',
              href: 'https://github.com/apps-in-toss-community/devtools',
            },
          ],
        },
        {
          title: 'Upstream',
          items: [
            {
              label: '@apps-in-toss/web-framework (npm)',
              href: 'https://www.npmjs.com/package/@apps-in-toss/web-framework',
            },
          ],
        },
        {
          title: 'Repo',
          items: [
            {
              label: 'GitHub',
              href: `https://github.com/${GITHUB_ORG}/${REPO}`,
            },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} apps-in-toss-community contributors. Unofficial community project.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'diff', 'json', 'tsx'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
