// src/navigation/types.ts

export type RootStackParamList = {
  AUTH: undefined;
  ONBOARDING: undefined;
  // Main app
  MAIN_TABS: undefined;
  CREATE_EVENT: undefined;
  EDIT_EVENT: { eventId: string };
  CANCEL_EVENT_CONFIRM: { eventId: string; eventTitle: string };
  EVENT_CREATED: { eventId: string; eventTitle: string };
  REPORT_USER: { userId: string; userName: string };
  REVIEW_SUBMISSION: {
    eventId: string;
    revieweeId: string;
    revieweeName: string;
    revieweePhoto: string;
    eventTitle: string;
  };
  REVIEW_SUBMITTED: undefined;
};

export type MainTabParamList = {
  FEED_STACK: undefined;
  CHATS_STACK: undefined;
  ORGANIZER_STACK: undefined;
  PROFILE_STACK: undefined;
};

export type FeedStackParamList = {
  FEED: undefined;
};

export type ChatsStackParamList = {
  CHAT_LIST: undefined;
  CHAT_THREAD: { chatId: string; eventTitle: string; participantName: string; participantPhoto: string };
  USER_PROFILE: { userId: string };
  ACTIVITY: undefined;
};

export type OrganizerStackParamList = {
  MY_EVENTS: undefined;
  EVENT_MANAGEMENT: { eventId: string };
  USER_PROFILE: { userId: string };
};

export type ProfileStackParamList = {
  MY_PROFILE: undefined;
  EDIT_PROFILE: undefined;
  SETTINGS: undefined;
  NOTIFICATION_SETTINGS: undefined;
  BLOCKED_USERS: undefined;
};
