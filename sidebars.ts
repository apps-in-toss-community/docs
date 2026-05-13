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
          label: 'ads',
          collapsed: false,
          items: [
            'api/ads/ads-overview',
            'api/ads/attach',
            'api/ads/attachBanner',
            'api/ads/destroy',
            'api/ads/destroyAll',
            'api/ads/initialize',
            'api/ads/isAppsInTossAdMobLoaded',
            'api/ads/loadAppsInTossAdMob',
            'api/ads/loadFullScreenAd',
            'api/ads/showAppsInTossAdMob',
            'api/ads/showFullScreenAd',
          ],
        },
        {
          type: 'category',
          label: 'analytics',
          collapsed: false,
          items: [
            'api/analytics/analytics-overview',
            'api/analytics/click',
            'api/analytics/impression',
            'api/analytics/screen',
          ],
        },
        {
          type: 'category',
          label: 'auth',
          collapsed: false,
          items: [
            'api/auth/auth-overview',
            'api/auth/appLogin',
            'api/auth/appsInTossSignTossCert',
            'api/auth/getAnonymousKey',
            'api/auth/getIsTossLoginIntegratedService',
          ],
        },
        {
          type: 'category',
          label: 'camera',
          collapsed: false,
          items: ['api/camera/openCamera'],
        },
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
          label: 'contacts',
          collapsed: false,
          items: [
            'api/contacts/contacts-overview',
            'api/contacts/contactsViral',
            'api/contacts/fetchAlbumPhotos',
            'api/contacts/fetchContacts',
          ],
        },
        {
          type: 'category',
          label: 'environment',
          collapsed: false,
          items: [
            'api/environment/environment-overview',
            'api/environment/getAppsInTossGlobals',
            'api/environment/getDeploymentId',
            'api/environment/getDeviceId',
            'api/environment/getGroupId',
            'api/environment/getLocale',
            'api/environment/getNetworkStatus',
            'api/environment/getOperationalEnvironment',
            'api/environment/getPlatformOS',
            'api/environment/getSafeAreaInsets',
            'api/environment/getSchemeUri',
            'api/environment/getServerTime',
            'api/environment/getTossAppVersion',
            'api/environment/isMinVersionSupported',
          ],
        },
        {
          type: 'category',
          label: 'events',
          collapsed: false,
          items: [
            'api/events/events-overview',
            'api/events/appsInTossEvent-addEventListener',
            'api/events/eventLog',
            'api/events/graniteEvent-addEventListener',
            'api/events/onVisibilityChangedByTransparentServiceWeb',
            'api/events/tdsEvent-addEventListener',
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
          label: 'game',
          collapsed: false,
          items: [
            'api/game/game-overview',
            'api/game/getGameCenterGameProfile',
            'api/game/getUserKeyForGame',
            'api/game/grantPromotionReward',
            'api/game/grantPromotionRewardForGame',
            'api/game/openGameCenterLeaderboard',
            'api/game/submitGameCenterLeaderBoardScore',
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
          label: 'iap',
          collapsed: false,
          items: [
            'api/iap/iap-overview',
            'api/iap/completeProductGrant',
            'api/iap/createOneTimePurchaseOrder',
            'api/iap/createSubscriptionPurchaseOrder',
            'api/iap/getCompletedOrRefundedOrders',
            'api/iap/getPendingOrders',
            'api/iap/getProductItemList',
            'api/iap/getSubscriptionInfo',
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
          label: 'partner',
          collapsed: false,
          items: [
            'api/partner/partner-overview',
            'api/partner/addAccessoryButton',
            'api/partner/removeAccessoryButton',
          ],
        },
        {
          type: 'category',
          label: 'permissions',
          collapsed: false,
          items: [
            'api/permissions/permissions-overview',
            'api/permissions/getPermission',
            'api/permissions/openPermissionDialog',
            'api/permissions/requestPermission',
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
