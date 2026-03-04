// src/screens/feed/EventDetailSheet.tsx
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { Calendar, MapPin, Star, ChevronLeft } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/Button';
import { cn, INTEREST_CATEGORIES, type Event } from '../../types';

export const EventDetailSheet = ({ event, onClose, navigation }: { event: Event, onClose: () => void, navigation: any }) => {
  const { token } = useAuthStore();
  const [requested, setRequested] = useState(false);

  const handleRequest = async () => {
    try {
      await fetch(`/api/events/${event.id}/swipe`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ direction: 'right' })
      });
      setRequested(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[100] bg-obsidian flex flex-col"
    >
      <div className="relative h-80">
        <img src={event.cover_photos[0]} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-black/20" />
        <button onClick={onClose} className="absolute top-6 left-6 p-3 bg-obsidian/40 backdrop-blur-xl text-white rounded-2xl border border-white/10 hover:bg-obsidian/60 transition-colors outline-none">
          <ChevronLeft size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 -mt-10 relative z-10 bg-obsidian rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-bold text-alabaster tracking-tight mb-2">{event.title}</h2>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-sunstone/10 text-sunstone rounded-full text-xs font-bold border border-sunstone/20">
              {INTEREST_CATEGORIES.find(c => c.id === event.event_type)?.icon}
              {INTEREST_CATEGORIES.find(c => c.id === event.event_type)?.label}
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-sunstone">{event.max_companions - event.approved_count} left</p>
            <p className="text-xs text-grey-mist font-medium">of {event.max_companions} spots</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-lava/30 p-4 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3 text-grey-mist mb-1">
              <Calendar size={16} className="text-sunstone" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Date & Time</span>
            </div>
            <p className="text-alabaster font-bold text-sm">{format(new Date(event.date_time), 'EEE, MMM d')}</p>
            <p className="text-grey-mist text-xs">{format(new Date(event.date_time), 'h:mm a')}</p>
          </div>
          <div className="bg-lava/30 p-4 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3 text-grey-mist mb-1">
              <MapPin size={16} className="text-sunstone" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Location</span>
            </div>
            <p className="text-alabaster font-bold text-sm truncate">{event.general_area}</p>
            <p className="text-grey-mist text-xs">General Area</p>
          </div>
        </div>

        <div className="mb-10">
          <h3 className="text-xs font-bold uppercase tracking-widest text-sunstone mb-4">About the event</h3>
          <p className="text-grey-mist leading-relaxed text-sm">{event.description || 'No description provided.'}</p>
        </div>

        <button 
          onClick={() => navigation.navigate('USER_PROFILE', { userId: event.organizer_id })}
          className="w-full text-left p-5 bg-lava/50 rounded-[2rem] flex flex-row items-center gap-4 border border-white/5 active:scale-[0.98] transition-transform outline-none"
        >
          <img src={event.organizer_photo} className="w-14 h-14 rounded-2xl object-cover border border-white/10" referrerPolicy="no-referrer" />
          <div className="flex-1">
            <p className="font-bold text-alabaster">{event.organizer_name}</p>
            <div className="flex items-center gap-1.5 text-xs text-grey-mist">
              <Star size={12} className="fill-solar text-solar" />
              <span className="font-bold text-alabaster">{event.avg_rating ? Number(event.avg_rating).toFixed(1) : 'New'}</span>
              <span className="opacity-50">({event.review_count || 0} reviews)</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-sunstone font-bold">View Profile</Button>
        </button>
      </div>

      <div className="p-8 bg-obsidian border-t border-white/5">
        <Button 
          className={cn("w-full py-5 text-xl", requested && "opacity-50")} 
          onClick={handleRequest}
          disabled={requested}
        >
          {requested ? 'Request Sent' : 'Request to Join'}
        </Button>
      </div>
    </motion.div>
  );
};
