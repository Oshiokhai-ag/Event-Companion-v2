// src/screens/profile/SettingsScreen.tsx
import React from 'react';
import { Bell, Shield, UserX, ChevronRight, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../types';

export const SettingsScreen = ({ navigation }: any) => {
  const { logout } = useAuthStore();

  const SettingItem = ({ icon: Icon, label, onPress, color = 'text-grey-mist' }: any) => (
    <button 
      onClick={onPress}
      className="w-full flex flex-row items-center gap-4 p-5 bg-lava/30 rounded-[1.5rem] border border-white/5 active:scale-[0.98] transition-transform outline-none"
    >
      <div className={cn('p-2 rounded-xl bg-lava/50', color)}>
        <Icon size={20} />
      </div>
      <span className="flex-1 text-left text-alabaster font-bold">{label}</span>
      <ChevronRight size={20} className="text-grey-mist/30" />
    </button>
  );

  return (
    <div className="flex-1 bg-obsidian p-8 overflow-y-auto">
      <div className="space-y-4 pb-20">
        <h2 className="text-xs font-bold uppercase tracking-widest text-sunstone mb-6 px-4">Account</h2>
        <SettingItem icon={Bell} label="Notifications" onPress={() => navigation.navigate('NOTIFICATION_SETTINGS')} />
        <SettingItem icon={Shield} label="Privacy & Safety" onPress={() => {}} />
        <SettingItem icon={UserX} label="Blocked Users" onPress={() => navigation.navigate('BLOCKED_USERS')} />
        
        <h2 className="text-xs font-bold uppercase tracking-widest text-sunstone mt-10 mb-6 px-4">Support</h2>
        <SettingItem icon={Shield} label="Terms of Service" onPress={() => {}} />
        <SettingItem icon={Shield} label="Privacy Policy" onPress={() => {}} />
        
        <div className="mt-12">
          <button 
            onClick={logout}
            className="w-full flex flex-row items-center justify-center gap-3 p-5 bg-ember/10 rounded-[1.5rem] border border-ember/20 active:scale-[0.98] transition-transform outline-none"
          >
            <LogOut size={20} className="text-ember" />
            <span className="text-ember font-bold">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
