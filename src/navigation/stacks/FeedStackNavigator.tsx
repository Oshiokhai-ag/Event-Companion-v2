// src/navigation/stacks/FeedStackNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { FeedStackParamList } from '../types';
import { SwipeFeedScreen } from '../../screens/feed/SwipeFeedScreen';

const FeedStack = createStackNavigator<FeedStackParamList>();

export const FeedStackNavigator = () => (
  <FeedStack.Navigator id="feed-stack" screenOptions={{ headerShown: false }}>
    <FeedStack.Screen name="FEED" component={SwipeFeedScreen} />
  </FeedStack.Navigator>
);
