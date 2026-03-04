// src/navigation/TabBar.tsx
import React from 'react';
import { Compass, MessageCircle, CalendarDays, User as UserIcon, Plus } from 'lucide-react';
import { cn } from '../types';
import { useChatStore } from '../store/chatStore';

export const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const { unreadCount } = useChatStore();

  const openCreateModal = () => {
    navigation.navigate('CREATE_EVENT');
  };

  const renderTab = (routeName: string, label: string, Icon: any, index: number, badgeCount?: number) => {
    const isFocused = state.index === index;

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: state.routes[index].key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(routeName);
      }
    };

    return (
      <button
        key={routeName}
        onClick={onPress}
        className="flex-1 flex flex-col items-center justify-center py-2 outline-none"
      >
        <div className="relative">
          <Icon 
            size={24} 
            strokeWidth={isFocused ? 2.5 : 2} 
            className={cn(isFocused ? 'text-sunstone' : 'text-grey-mist')} 
          />
          {badgeCount ? (
            <div className="absolute -top-1 -right-1 bg-ember min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
              <span className="text-alabaster text-[10px] font-bold">{badgeCount}</span>
            </div>
          ) : null}
        </div>
        <span className={cn('text-[9px] font-medium mt-1 uppercase tracking-wide', isFocused ? 'text-sunstone' : 'text-grey-mist')}>
          {label}
        </span>
      </button>
    );
  };

  return (
    <div className="flex flex-row items-center justify-around bg-lava/75 backdrop-blur-xl border-t border-white/5 h-20 px-2 pb-safe">
      {renderTab('FEED_STACK', 'Discover', Compass, 0)}
      {renderTab('CHATS_STACK', 'Chats', MessageCircle, 1, unreadCount)}

      <button
        onClick={openCreateModal}
        className="w-13 h-13 rounded-full bg-sunstone flex items-center justify-center shadow-lg shadow-sunstone/40 -mt-8 outline-none active:scale-95 transition-transform"
      >
        <Plus color="#F4F1EA" size={24} strokeWidth={2.5} />
      </button>

      {renderTab('ORGANIZER_STACK', 'My Events', CalendarDays, 2)}
      {renderTab('PROFILE_STACK', 'Profile', UserIcon, 3)}
    </div>
  );
};
