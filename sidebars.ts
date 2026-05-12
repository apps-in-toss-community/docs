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
      label: 'Guides',
      collapsed: false,
      items: ['guides/permissions-pattern'],
    },
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
        {
          type: 'category',
          label: 'haptic',
          collapsed: false,
          items: [
            'api/haptic/haptic-overview',
            'api/haptic/generateHapticFeedback',
            'api/haptic/saveBase64Data',
          ],
        },
        {
          type: 'category',
          label: 'navigation',
          collapsed: false,
          items: [
            'api/navigation/navigation-overview',
            'api/navigation/closeView',
            'api/navigation/getTossShareLink',
            'api/navigation/openURL',
            'api/navigation/requestReview',
            'api/navigation/setDeviceOrientation',
            'api/navigation/setIosSwipeGestureEnabled',
            'api/navigation/setScreenAwakeMode',
            'api/navigation/setSecureScreen',
            'api/navigation/share',
          ],
        },
        {
          type: 'category',
          label: 'storage',
          collapsed: false,
          items: [
            'api/storage/storage-overview',
            'api/storage/clearItems',
            'api/storage/getItem',
            'api/storage/removeItem',
            'api/storage/setItem',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      collapsed: false,
      items: ['reference/glossary'],
    },
  ],
};

export default sidebars;
