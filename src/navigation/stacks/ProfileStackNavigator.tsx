// src/navigation/stacks/ProfileStackNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ProfileStackParamList } from '../types';
import { MyProfileScreen } from '../../screens/profile/MyProfileScreen';
import { EditProfileScreen } from '../../screens/profile/EditProfileScreen';
import { SettingsScreen } from '../../screens/profile/SettingsScreen';
import { NotificationSettingsScreen } from '../../screens/profile/NotificationSettingsScreen';
import { BlockedUsersScreen } from '../../screens/profile/BlockedUsersScreen';

const ProfileStack = createStackNavigator<ProfileStackParamList>();

export const ProfileStackNavigator = () => (
  <ProfileStack.Navigator
    id="profile-stack"
    screenOptions={{
      headerStyle: { backgroundColor: '#2D333B' },
      headerTitleStyle: { fontWeight: '600', fontSize: 17, color: '#F4F1EA' },
      headerTintColor: '#F4F1EA',
    }}
  >
    <ProfileStack.Screen name="MY_PROFILE" component={MyProfileScreen} options={{ title: 'Profile' }} />
    <ProfileStack.Screen name="EDIT_PROFILE" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
    <ProfileStack.Screen name="SETTINGS" component={SettingsScreen} options={{ title: 'Settings' }} />
    <ProfileStack.Screen name="NOTIFICATION_SETTINGS" component={NotificationSettingsScreen} options={{ title: 'Notifications' }} />
    <ProfileStack.Screen name="BLOCKED_USERS" component={BlockedUsersScreen} options={{ title: 'Blocked Users' }} />
  </ProfileStack.Navigator>
);
