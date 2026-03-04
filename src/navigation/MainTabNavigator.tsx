// src/navigation/MainTabNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CustomTabBar } from './TabBar';
import { MainTabParamList } from './types';
import { FeedStackNavigator } from './stacks/FeedStackNavigator';
import { ChatsStackNavigator } from './stacks/ChatsStackNavigator';
import { OrganizerStackNavigator } from './stacks/OrganizerStackNavigator';
import { ProfileStackNavigator } from './stacks/ProfileStackNavigator';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator = () => (
  <Tab.Navigator
    id="main-tabs"
    tabBar={(props) => <CustomTabBar {...props} />}
    screenOptions={{ headerShown: false }}
  >
    <Tab.Screen name="FEED_STACK" component={FeedStackNavigator} />
    <Tab.Screen name="CHATS_STACK" component={ChatsStackNavigator} />
    <Tab.Screen name="ORGANIZER_STACK" component={OrganizerStackNavigator} />
    <Tab.Screen name="PROFILE_STACK" component={ProfileStackNavigator} />
  </Tab.Navigator>
);
