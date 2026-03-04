// src/screens/events/MyEventsDashboardScreen.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/Button';
import { cn, type Event } from '../../types';

export const MyEventsDashboardScreen = ({ navigation }: any) => {
  const { token } = useAuthStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchMyEvents();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchMyEvents = async () => {
    try {
      const res = await fetch('/api/my-events', {
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

  return (
    <div className="flex-1 bg-obsidian p-8 overflow-y-auto">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-alabaster tracking-tight">My Events</h1>
        <Button size="sm" onClick={() => navigation.navigate('CREATE_EVENT')} className="rounded-2xl">
          <Plus size={20} />
          Create
        </Button>
      </div>

      <div className="space-y-4 pb-20">
        {loading ? (
          <div className="text-center py-20 text-grey-mist">Loading...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 text-grey-mist">
            <Plus size={48} className="mx-auto mb-4 opacity-10" />
            <p>You haven't created any events yet.</p>
          </div>
        ) : events.map((event) => (
          <button 
            key={event.id} 
            className="w-full text-left bg-lava/30 border border-white/5 rounded-[2rem] p-5 flex flex-row gap-5 active:scale-[0.98] transition-transform outline-none"
            onClick={() => navigation.navigate('EVENT_MANAGEMENT', { eventId: event.id })}
          >
            <img src={event.cover_photos[0]} className="w-24 h-24 rounded-2xl object-cover shadow-lg" referrerPolicy="no-referrer" />
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h3 className="text-lg font-bold text-alabaster truncate mb-1">{event.title}</h3>
              <p className="text-xs text-grey-mist font-medium mb-3 flex items-center gap-1.5">
                <Calendar size={12} className="text-sunstone" />
                {format(new Date(event.date_time), 'MMM d, h:mm a')}
              </p>
              <div className="flex flex-row gap-2">
                <span className={cn(
                  "text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border",
                  event.status === 'ACTIVE' ? 'bg-verdant/10 text-verdant border-verdant/20' : 'bg-grey-mist/10 text-grey-mist border-grey-mist/20'
                )}>
                  {event.status}
                </span>
                {(event as any).pending_count > 0 && (
                  <span className="text-[10px] uppercase tracking-widest font-bold px-3 py-1 bg-sunstone/10 text-sunstone rounded-full border border-sunstone/20 animate-pulse">
                    {(event as any).pending_count} pending
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
