// src/screens/chats/ActivityScreen.tsx
import React, { useState, useEffect } from 'react';
import { Calendar, X, CheckCircle2, Clock } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../types';

export const ActivityScreen = () => {
  const { token } = useAuthStore();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/my-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    if (!window.confirm('Cancel this request?')) return;
    await fetch(`/api/requests/${requestId}/cancel`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchRequests();
  };

  return (
    <div className="flex-1 bg-obsidian p-8 overflow-y-auto">
      <div className="space-y-6 pb-20">
        <h2 className="text-xs font-bold uppercase tracking-widest text-sunstone mb-6 px-4">My Join Requests</h2>
        {loading ? (
          <div className="text-center py-20 text-grey-mist">Loading...</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-20 text-grey-mist opacity-50">
            <Calendar size={48} className="mx-auto mb-4" />
            <p className="font-medium">No active requests</p>
          </div>
        ) : (
          requests.map((req) => (
            <div key={req.id} className="flex items-center gap-5 p-5 bg-lava/30 rounded-[2rem] border border-white/5">
              <img src={req.organizer_photo} className="w-16 h-16 rounded-2xl object-cover border border-white/10" referrerPolicy="no-referrer" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-alabaster truncate mb-1">{req.event_title}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-xs text-grey-mist">Organizer: {req.organizer_name}</p>
                </div>
                <div className="flex flex-row items-center gap-2">
                  {req.status === 'PENDING' ? (
                    <div className="flex flex-row items-center gap-1.5 px-3 py-1 bg-sunstone/10 text-sunstone rounded-full border border-sunstone/20">
                      <Clock size={12} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Pending</span>
                    </div>
                  ) : req.status === 'APPROVED' ? (
                    <div className="flex flex-row items-center gap-1.5 px-3 py-1 bg-verdant/10 text-verdant rounded-full border border-verdant/20">
                      <CheckCircle2 size={12} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Approved</span>
                    </div>
                  ) : (
                    <div className="flex flex-row items-center gap-1.5 px-3 py-1 bg-ember/10 text-ember rounded-full border border-ember/20">
                      <X size={12} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Declined</span>
                    </div>
                  )}
                </div>
              </div>
              {req.status === 'PENDING' && (
                <button onClick={() => handleCancelRequest(req.id)} className="p-3 bg-ember/10 rounded-xl text-ember outline-none active:scale-95 transition-transform">
                  <X size={20} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
