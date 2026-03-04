// src/screens/events/EventManagementScreen.tsx
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Slash, User as UserIcon, Star, CheckCircle2, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { cn, INTEREST_CATEGORIES, type Event, type JoinRequest } from '../../types';

export const EventManagementScreen = ({ route, navigation }: any) => {
  const { eventId } = route.params;
  const { token } = useAuthStore();
  const [event, setEvent] = useState<Event | null>(null);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [tab, setTab] = useState<'pending' | 'approved'>('pending');

  useEffect(() => {
    fetchEvent();
    fetchRequests();
  }, [eventId]);

  const fetchEvent = async () => {
    const res = await fetch(`/api/events/${eventId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setEvent(data);
  };

  const fetchRequests = async () => {
    const res = await fetch(`/api/events/${eventId}/requests`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setRequests(data);
  };

  const handleResolve = async (requestId: string, status: 'APPROVED' | 'DECLINED') => {
    const message = status === 'DECLINED' 
      ? 'Are you sure? This user will be notified.' 
      : 'Approve this request? This will start a private chat.';
    
    if (!window.confirm(message)) return;

    await fetch(`/api/requests/${requestId}/resolve`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    fetchRequests();
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel this event? All interested users will be notified. This cannot be undone.')) return;
    await fetch(`/api/events/${eventId}/cancel`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    navigation.goBack();
  };

  if (!event) return null;

  const filteredRequests = requests.filter(r => tab === 'pending' ? r.status === 'PENDING' : r.status === 'APPROVED');

  return (
    <div className="flex-1 bg-obsidian flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-obsidian/50 backdrop-blur-xl">
        <button onClick={() => navigation.goBack()} className="p-2 text-grey-mist hover:text-alabaster transition-colors outline-none"><ChevronLeft size={24} /></button>
        <h2 className="text-xl font-bold text-alabaster tracking-tight truncate max-w-[200px]">{event.title}</h2>
        <button onClick={handleCancel} className="p-2 text-ember hover:bg-ember/10 rounded-xl transition-colors outline-none"><Slash size={20} /></button>
      </div>

      <div className="flex p-2 bg-lava/30 mx-6 mt-6 rounded-2xl border border-white/5">
        <button 
          onClick={() => setTab('pending')}
          className={cn(
            'flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-all rounded-xl relative outline-none',
            tab === 'pending' ? 'text-sunstone bg-sunstone/10' : 'text-grey-mist'
          )}
        >
          Pending
        </button>
        <button 
          onClick={() => setTab('approved')}
          className={cn(
            'flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-all rounded-xl relative outline-none',
            tab === 'approved' ? 'text-sunstone bg-sunstone/10' : 'text-grey-mist'
          )}
        >
          Approved
        </button>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        {filteredRequests.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-grey-mist opacity-50 py-20">
            <UserIcon size={48} className="mb-4" />
            <p className="text-sm font-medium">No {tab} requests yet</p>
          </div>
        ) : (
          <div className="space-y-6 pb-20">
            {filteredRequests.map((req) => (
              <div key={req.id} className="flex items-center gap-5 p-4 bg-lava/30 rounded-[2rem] border border-white/5">
                <button 
                  onClick={() => navigation.navigate('USER_PROFILE', { userId: req.requester_id })}
                  className="outline-none active:scale-95 transition-transform"
                >
                  <img 
                    src={req.requester_photo} 
                    className="w-16 h-16 rounded-2xl object-cover border border-white/10" 
                    referrerPolicy="no-referrer"
                  />
                </button>
                <div 
                  className="flex-1 min-w-0 text-left" 
                >
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-alabaster truncate">{req.requester_name}</p>
                    {req.phone_verified && <CheckCircle2 size={14} className="text-verdant" />}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-grey-mist mb-2">
                    <Star size={12} className="fill-solar text-solar" />
                    <span className="text-alabaster font-bold">{req.avg_rating ? Number(req.avg_rating).toFixed(1) : 'New'}</span>
                  </div>
                  <div className="flex flex-row gap-1.5">
                    {req.requester_interests?.slice(0, 4).map(i => (
                      <span key={i} className="w-6 h-6 flex items-center justify-center bg-obsidian rounded-lg text-xs border border-white/5">
                        {INTEREST_CATEGORIES.find(c => c.id === i)?.icon}
                      </span>
                    ))}
                  </div>
                </div>
                {tab === 'pending' && (
                  <div className="flex flex-row gap-2">
                    <button onClick={() => handleResolve(req.id, 'DECLINED')} className="w-10 h-10 flex items-center justify-center text-ember bg-ember/10 rounded-xl hover:bg-ember/20 transition-colors outline-none">
                      <X size={20} />
                    </button>
                    <button onClick={() => handleResolve(req.id, 'APPROVED')} className="w-10 h-10 flex items-center justify-center text-verdant bg-verdant/10 rounded-xl hover:bg-verdant/20 transition-colors outline-none">
                      <CheckCircle2 size={20} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
