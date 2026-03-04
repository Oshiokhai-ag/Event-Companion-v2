// src/screens/profile/NotificationSettingsScreen.tsx
import React, { useState } from 'react';
import { Bell, MessageCircle, Calendar, Star } from 'lucide-react';
import { cn } from '../../types';

export const NotificationSettingsScreen = () => {
  const [settings, setSettings] = useState({
    newMessages: true,
    eventApprovals: true,
    eventReminders: true,
    newReviews: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const SettingRow = ({ icon: Icon, label, description, value, onToggle }: any) => (
    <div className="flex items-center gap-5 p-6 bg-lava/30 rounded-[2rem] border border-white/5">
      <div className="p-3 rounded-2xl bg-sunstone/10 text-sunstone">
        <Icon size={24} />
      </div>
      <div className="flex-1">
        <p className="font-bold text-alabaster">{label}</p>
        <p className="text-xs text-grey-mist mt-1">{description}</p>
      </div>
      <button 
        onClick={onToggle}
        className={cn(
          "w-12 h-6 rounded-full transition-colors relative outline-none",
          value ? "bg-sunstone" : "bg-lava"
        )}
      >
        <div className={cn(
          "absolute top-1 w-4 h-4 rounded-full bg-alabaster transition-all",
          value ? "left-7" : "left-1"
        )} />
      </button>
    </div>
  );

  return (
    <div className="flex-1 bg-obsidian p-8 overflow-y-auto">
      <div className="space-y-6 pb-20">
        <h2 className="text-xs font-bold uppercase tracking-widest text-sunstone mb-6 px-4">Push Notifications</h2>
        <SettingRow 
          icon={MessageCircle} 
          label="New Messages" 
          description="When you receive a message in a chat"
          value={settings.newMessages}
          onToggle={() => toggleSetting('newMessages')}
        />
        <SettingRow 
          icon={Calendar} 
          label="Event Approvals" 
          description="When an organizer approves your request"
          value={settings.eventApprovals}
          onToggle={() => toggleSetting('eventApprovals')}
        />
        <SettingRow 
          icon={Bell} 
          label="Event Reminders" 
          description="Reminders for your upcoming events"
          value={settings.eventReminders}
          onToggle={() => toggleSetting('eventReminders')}
        />
        <SettingRow 
          icon={Star} 
          label="New Reviews" 
          description="When someone leaves you a review"
          value={settings.newReviews}
          onToggle={() => toggleSetting('newReviews')}
        />
      </div>
    </div>
  );
};
