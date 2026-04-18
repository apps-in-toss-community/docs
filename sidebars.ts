import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

/**
 * Sidebar is the source of truth for `<group>` naming used in the
 * docs ↔ sdk-example deep-link contract. See PLAN.md §3.
 *
 * Only the pages that actually exist right now are listed here.
 * New API pages are added in follow-up PRs.
 */
const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    {
      type: 'category',
      label: 'API',
      collapsed: false,
      items: [
        {
          type: 'category',
          label: 'clipboard',
          items: ['api/clipboard/setClipboardText'],
        },
      ],
    },
  ],
};

export default sidebars;
