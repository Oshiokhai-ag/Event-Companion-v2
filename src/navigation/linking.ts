// src/navigation/linking.ts
export const linkingConfig = {
  prefixes: [window.location.origin],
  config: {
    screens: {
      AUTH: 'auth',
      ONBOARDING: 'onboarding',
      MAIN_TABS: {
        screens: {
          FEED_STACK: 'feed',
          CHATS_STACK: 'chats',
          ORGANIZER_STACK: 'organizer',
          PROFILE_STACK: 'profile',
        },
      },
    },
  },
};
