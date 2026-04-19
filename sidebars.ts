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
          collapsed: false,
          items: [
            'api/clipboard/clipboard-overview',
            'api/clipboard/getClipboardText',
            'api/clipboard/setClipboardText',
          ],
        },
        {
          type: 'category',
          label: 'location',
          collapsed: false,
          items: [
            'api/location/location-overview',
            'api/location/getCurrentLocation',
            'api/location/startUpdateLocation',
          ],
        },
      ],
    },
  ],
};

export default sidebars;
