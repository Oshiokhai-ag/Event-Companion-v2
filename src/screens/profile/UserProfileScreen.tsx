// src/screens/profile/UserProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ChevronLeft, MapPin, Star } from 'lucide-react';
import { cn, INTEREST_CATEGORIES } from '../../types';

export const UserProfileScreen = ({ route, navigation }: any) => {
  const { userId } = route.params;
  const [user, setUser] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => setUser(data));
    
    fetch(`/api/users/${userId}/reviews`)
      .then(res => res.json())
      .then(data => setReviews(data));
  }, [userId]);

  if (!user) return null;

  const interests = typeof user.interests === 'string' ? JSON.parse(user.interests || '[]') : (user.interests || []);

  return (
    <div className="flex-1 bg-obsidian flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-white/5 flex items-center gap-4 bg-obsidian/50 backdrop-blur-xl">
        <button onClick={() => navigation.goBack()} className="p-2 text-grey-mist hover:text-alabaster transition-colors outline-none"><ChevronLeft size={24} /></button>
        <h2 className="text-xl font-bold text-alabaster tracking-tight">Profile</h2>
      </div>
      <div className="flex-1 p-8 overflow-y-auto">
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
          <div className="flex items-center justify-center gap-2 text-grey-mist font-medium">
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

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-sunstone mb-6">Recent Reviews</h3>
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="text-center py-10 bg-lava/30 rounded-[2rem] border border-white/5">
                  <p className="text-sm text-grey-mist">No reviews yet.</p>
                </div>
              ) : reviews.map(r => (
                <div key={r.id} className="p-6 bg-lava/30 rounded-[2rem] border border-white/5">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex flex-row items-center gap-1">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} size={14} className={cn(s <= r.rating ? 'fill-solar text-solar' : 'text-white/10')} />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-grey-mist uppercase tracking-widest">{format(new Date(r.created_at), 'MMM d, yyyy')}</span>
                  </div>
                  <p className="text-alabaster leading-relaxed italic mb-4">"{r.review_text}"</p>
                  <div className="flex flex-row items-center gap-2">
                    <div className="w-4 h-px bg-sunstone/30" />
                    <p className="text-[10px] font-bold text-grey-mist uppercase tracking-widest">Reviewed by {r.reviewer_name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
