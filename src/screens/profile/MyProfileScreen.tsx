// src/screens/profile/MyProfileScreen.tsx
import React from 'react';
import { Settings, Edit, LogOut, MapPin } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/Button';
import { INTEREST_CATEGORIES } from '../../types';

export const MyProfileScreen = ({ navigation }: any) => {
  const { user, logout } = useAuthStore();

  if (!user) return null;

  const interests = typeof user.interests === 'string' ? JSON.parse(user.interests || '[]') : (user.interests || []);

  return (
    <div className="flex-1 bg-obsidian p-8 overflow-y-auto">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-alabaster tracking-tight">Profile</h1>
        <div className="flex flex-row gap-2">
          <button onClick={() => navigation.navigate('SETTINGS')} className="p-2 bg-lava/40 rounded-xl border border-white/5 outline-none hover:bg-lava/60 transition-colors">
            <Settings size={20} className="text-grey-mist" />
          </button>
          <button onClick={() => navigation.navigate('EDIT_PROFILE')} className="p-2 bg-lava/40 rounded-xl border border-white/5 outline-none hover:bg-lava/60 transition-colors">
            <Edit size={20} className="text-grey-mist" />
          </button>
        </div>
      </div>

      <div className="text-center mb-10">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-sunstone blur-2xl opacity-20 rounded-full" />
          <img 
            src={user.profile_photo_url} 
            className="w-40 h-40 rounded-[2.5rem] object-cover relative z-10 border-4 border-lava shadow-2xl rotate-3" 
            referrerPolicy="no-referrer" 
          />
        </div>
        <h2 className="text-3xl font-bold text-alabaster tracking-tight mb-2">{user.name}</h2>
        <div className="flex flex-row items-center justify-center gap-2 text-grey-mist font-medium">
          <MapPin size={16} className="text-sunstone" />
          <span>{user.location_city}</span>
        </div>
      </div>

      <div className="space-y-10 pb-20">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-sunstone mb-4">Bio</h3>
          <div className="bg-lava/30 p-6 rounded-[2rem] border border-white/5">
            <p className="text-grey-mist leading-relaxed italic">"{user.bio || 'No bio provided.'}"</p>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-sunstone mb-4">Interests</h3>
          <div className="flex flex-row flex-wrap gap-3">
            {interests.map((i: string) => (
              <span key={i} className="px-4 py-2 bg-lava text-alabaster rounded-2xl text-xs font-bold border border-white/5 flex flex-row items-center gap-2">
                {INTEREST_CATEGORIES.find(c => c.id === i)?.icon} {INTEREST_CATEGORIES.find(c => c.id === i)?.label}
              </span>
            ))}
          </div>
        </div>

        <Button variant="ghost" className="w-full py-4 text-ember border border-ember/10" onClick={logout}>
          <LogOut size={20} />
          Sign Out
        </Button>
      </div>
    </div>
  );
};
