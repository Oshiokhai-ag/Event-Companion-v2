// src/screens/feed/SwipeFeedScreen.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { Calendar, MapPin, Star, X, Heart, Undo2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/Button';
import { cn, INTEREST_CATEGORIES, type Event } from '../../types';
import { EventDetailSheet } from './EventDetailSheet';

export const SwipeFeedScreen = ({ navigation }: any) => {
  const { token } = useAuthStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showDetail, setShowDetail] = useState<Event | null>(null);

  const [lastAction, setLastAction] = useState<{ id: string, direction: 'left' | 'right' } | null>(null);
  const [showUndo, setShowUndo] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/feed', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    const event = events[currentIndex];
    try {
      await fetch(`/api/events/${event.id}/swipe`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ direction })
      });
      setLastAction({ id: event.id, direction });
      setShowUndo(true);
      setTimeout(() => setShowUndo(false), 5000);
      setCurrentIndex(currentIndex + 1);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUndo = async () => {
    if (!lastAction) return;
    try {
      const res = await fetch(`/api/swipes/undo`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setEvents(prev => [data.restored_event, ...prev]);
        setCurrentIndex(0);
        setShowUndo(false);
        setLastAction(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center text-alabaster">Finding events...</div>;

  if (currentIndex >= events.length) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-obsidian">
        <div className="w-24 h-24 bg-lava rounded-[2rem] mb-8 flex items-center justify-center text-grey-mist rotate-6">
          <Calendar size={48} className="-rotate-6" />
        </div>
        <h2 className="text-2xl font-bold mb-3 text-alabaster">No events near you yet!</h2>
        <p className="text-grey-mist mb-10 leading-relaxed">Try expanding your search radius in Settings, or be the first to post an event.</p>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <Button variant="outline" onClick={() => navigation.navigate('PROFILE_STACK', { screen: 'MY_PROFILE' })}>Adjust Radius</Button>
          <Button onClick={() => navigation.navigate('ORGANIZER_STACK', { screen: 'MY_EVENTS' })}>Create an Event</Button>
          <Button variant="ghost" size="sm" onClick={fetchEvents}>Refresh Feed</Button>
        </div>
      </div>
    );
  }

  const currentEvent = events[currentIndex];

  return (
    <div className="h-full relative p-4 flex flex-col bg-obsidian">
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20 pointer-events-none">
        <h1 className="text-2xl font-bold text-alabaster tracking-tighter pointer-events-auto">Companion</h1>
        <div className="w-10 h-10 rounded-2xl bg-lava/40 backdrop-blur-xl border border-white/10 flex items-center justify-center opacity-50 pointer-events-auto">
          <Calendar size={20} className="text-alabaster" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentEvent.id}
          initial={{ scale: 0.9, opacity: 0, rotate: -2 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ x: 500, opacity: 0, rotate: 10 }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          className="flex-1 relative rounded-[2.5rem] overflow-hidden shadow-2xl bg-lava border border-white/5 cursor-pointer"
          onClick={() => setShowDetail(currentEvent)}
        >
          <img 
            src={currentEvent.cover_photos[0]} 
            className="absolute inset-0 w-full h-full object-cover" 
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/20 to-transparent" />
          
          <div className="absolute top-20 left-6 right-6 flex justify-between">
            <div className="bg-obsidian/60 backdrop-blur-xl text-alabaster px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 border border-white/10">
              {INTEREST_CATEGORIES.find(c => c.id === currentEvent.event_type)?.icon}
              {INTEREST_CATEGORIES.find(c => c.id === currentEvent.event_type)?.label}
            </div>
            <div className={cn(
              'px-4 py-2 rounded-2xl text-xs font-bold backdrop-blur-xl border border-white/10',
              currentEvent.max_companions - currentEvent.approved_count > 1 ? 'bg-verdant/80 text-white' : 'bg-sunstone/80 text-white'
            )}>
              {currentEvent.max_companions - currentEvent.approved_count} spots left
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-8 text-alabaster">
            <h3 className="text-3xl font-bold mb-2 tracking-tight">{currentEvent.title}</h3>
            <div className="flex flex-wrap items-center gap-4 text-sm text-grey-mist mb-6">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-sunstone" />
                {format(new Date(currentEvent.date_time), 'EEE, MMM d, h:mm a')}
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-sunstone" />
                {currentEvent.general_area}
              </div>
            </div>
            
            <div className="flex items-center gap-4 pt-6 border-t border-white/5">
              <img src={currentEvent.organizer_photo} className="w-11 h-11 rounded-2xl object-cover border border-white/10 shadow-lg" referrerPolicy="no-referrer" />
              <div>
                <p className="text-sm font-bold">{currentEvent.organizer_name}</p>
                <div className="flex items-center gap-1.5 text-xs text-grey-mist">
                  <Star size={12} className="fill-solar text-solar" />
                  <span className="font-bold text-alabaster">{currentEvent.avg_rating ? Number(currentEvent.avg_rating).toFixed(1) : 'New'}</span>
                  <span className="opacity-50">({currentEvent.review_count || 0})</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-center gap-8 mt-8 pb-6 relative">
        <AnimatePresence>
          {showUndo && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.5, x: -20 }}
              onClick={handleUndo}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-lava rounded-2xl shadow-xl text-grey-mist border border-white/10 flex items-center justify-center hover:text-alabaster transition-colors outline-none"
            >
              <Undo2 size={24} />
            </motion.button>
          )}
        </AnimatePresence>
        <button 
          onClick={() => handleSwipe('left')}
          className="w-20 h-20 bg-lava rounded-[2rem] flex items-center justify-center text-grey-mist shadow-2xl border border-white/5 hover:scale-110 active:scale-90 transition-all hover:text-ember outline-none"
        >
          <X size={40} />
        </button>
        <button 
          onClick={() => handleSwipe('right')}
          className="w-20 h-20 bg-sunstone rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-sunstone/30 hover:scale-110 active:scale-90 transition-all outline-none"
        >
          <Heart size={40} fill="currentColor" />
        </button>
      </div>

      <AnimatePresence>
        {showDetail && (
          <EventDetailSheet event={showDetail} onClose={() => setShowDetail(null)} navigation={navigation} />
        )}
      </AnimatePresence>
    </div>
  );
};
