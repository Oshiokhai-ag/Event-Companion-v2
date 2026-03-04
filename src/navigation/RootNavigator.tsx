// src/navigation/RootNavigator.tsx
import { createRef } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import {
  NavigationContainer,
  NavigationContainerRef,
  createNavigationContainerRef,
} from '@react-navigation/native';

import { useAuthStore } from '../store/authStore';

// ─── Screen imports ──────────────────────────────────────────────────────────
import { AuthScreen } from '../screens/auth/AuthScreen';
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';
import { MainTabNavigator } from './MainTabNavigator';

// Modal screens
import { CreateEventModal } from '../screens/events/CreateEventModal';
import { EditEventModal } from '../screens/events/EditEventModal';
import { EventCreatedConfirmationScreen } from '../screens/events/EventCreatedConfirmationScreen';
import { EventCancellationConfirmationModal } from '../screens/events/EventCancellationConfirmationModal';
import { ReportUserModal } from '../screens/shared/ReportUserModal';
import { ReviewSubmissionScreen } from '../screens/shared/ReviewSubmissionScreen';
import { ReviewSubmittedScreen } from '../screens/shared/ReviewSubmittedScreen';

// ─── Types ────────────────────────────────────────────────────────────────────
import { RootStackParamList } from './types';

// ─── Deep linking config ──────────────────────────────────────────────────────
import { linkingConfig } from './linking';

// ─── Navigation ref (for out-of-component navigation, e.g. from notification handler) ──
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

const RootStack = createStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const { isAuthenticated, hasCompletedOnboarding } = useAuthStore();

  return (
    <NavigationContainer ref={navigationRef} linking={linkingConfig}>
      <RootStack.Navigator
        id="root"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#1A1E24' },
        }}
      >
        {!isAuthenticated ? (
          <RootStack.Screen name="AUTH" component={AuthScreen} />
        ) : !hasCompletedOnboarding ? (
          <RootStack.Screen name="ONBOARDING" component={OnboardingScreen} />
        ) : (
          <>
            <RootStack.Screen name="MAIN_TABS" component={MainTabNavigator} />

            {/* ── Modals presented as full-screen overlays over tabs ── */}
            <RootStack.Group
              screenOptions={{
                presentation: 'modal',
                cardStyle: { backgroundColor: '#1A1E24' },
              }}
            >
              <RootStack.Screen name="CREATE_EVENT" component={CreateEventModal} />
              <RootStack.Screen name="EDIT_EVENT" component={EditEventModal} />
              <RootStack.Screen name="EVENT_CREATED" component={EventCreatedConfirmationScreen} />
              <RootStack.Screen name="CANCEL_EVENT_CONFIRM" component={EventCancellationConfirmationModal} />
              <RootStack.Screen name="REPORT_USER" component={ReportUserModal} />
              <RootStack.Screen name="REVIEW_SUBMISSION" component={ReviewSubmissionScreen} />
              <RootStack.Screen name="REVIEW_SUBMITTED" component={ReviewSubmittedScreen} />
            </RootStack.Group>
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};
