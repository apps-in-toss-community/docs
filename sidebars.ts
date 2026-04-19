import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

/**
 * Sidebar is the source of truth for `<group>` naming used in the
 * docs ↔ sdk-example deep-link contract. See CLAUDE.md → "sdk-example deep-link 컨벤션".
 *
 * Each API namespace is a collapsible category with an Overview entry
 * (the namespace `index.mdx`) followed by method pages in alphabetical order.
 * New namespaces are added as sibling categories.
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
          collapsible: true,
          collapsed: false,
          items: [
            {
              type: 'doc',
              id: 'api/clipboard/clipboard-overview',
              label: 'Overview',
            },
            'api/clipboard/getClipboardText',
            'api/clipboard/setClipboardText',
          ],
        },
      ],
    },
  ],
};

export default sidebars;
