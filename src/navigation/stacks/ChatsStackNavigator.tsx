// src/navigation/stacks/ChatsStackNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ChatsStackParamList } from '../types';
import { ChatListScreen } from '../../screens/chats/ChatListScreen';
import { ChatThreadScreen } from '../../screens/chats/ChatThreadScreen';
import { UserProfileScreen } from '../../screens/profile/UserProfileScreen';
import { ActivityScreen } from '../../screens/chats/ActivityScreen';

const ChatsStack = createStackNavigator<ChatsStackParamList>();

export const ChatsStackNavigator = () => (
  <ChatsStack.Navigator
    id="chats-stack"
    screenOptions={{
      headerStyle: { backgroundColor: '#2D333B' },
      headerTitleStyle: { fontWeight: '600', fontSize: 17, color: '#F4F1EA' },
      headerTintColor: '#F4F1EA',
    }}
  >
    <ChatsStack.Screen name="CHAT_LIST" component={ChatListScreen} options={{ title: 'Chats' }} />
    <ChatsStack.Screen name="CHAT_THREAD" component={ChatThreadScreen} options={{ headerShown: false }} />
    <ChatsStack.Screen name="USER_PROFILE" component={UserProfileScreen} options={{ headerShown: false }} />
    <ChatsStack.Screen name="ACTIVITY" component={ActivityScreen} options={{ title: 'My Requests' }} />
  </ChatsStack.Navigator>
);
