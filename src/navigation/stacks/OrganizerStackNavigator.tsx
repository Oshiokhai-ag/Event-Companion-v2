// src/navigation/stacks/OrganizerStackNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { OrganizerStackParamList } from '../types';
import { MyEventsDashboardScreen } from '../../screens/events/MyEventsDashboardScreen';
import { EventManagementScreen } from '../../screens/events/EventManagementScreen';
import { UserProfileScreen } from '../../screens/profile/UserProfileScreen';

const OrganizerStack = createStackNavigator<OrganizerStackParamList>();

export const OrganizerStackNavigator = () => (
  <OrganizerStack.Navigator
    id="organizer-stack"
    screenOptions={{
      headerStyle: { backgroundColor: '#2D333B' },
      headerTitleStyle: { fontWeight: '600', fontSize: 17, color: '#F4F1EA' },
      headerTintColor: '#F4F1EA',
    }}
  >
    <OrganizerStack.Screen name="MY_EVENTS" component={MyEventsDashboardScreen} options={{ title: 'My Events' }} />
    <OrganizerStack.Screen name="EVENT_MANAGEMENT" component={EventManagementScreen} options={{ title: 'Manage Event' }} />
    <OrganizerStack.Screen name="USER_PROFILE" component={UserProfileScreen} options={{ headerShown: false }} />
  </OrganizerStack.Navigator>
);
