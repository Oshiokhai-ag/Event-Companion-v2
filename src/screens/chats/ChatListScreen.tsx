// src/screens/chats/ChatListScreen.tsx
import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { Button } from '../../components/Button';
import { cn, type ChatThread } from '../../types';

const isMine = (thread: ChatThread, userId?: string) => {
  return thread.last_message_sender_id === userId;
};

export const ChatListScreen = ({ navigation }: any) => {
  const { token, user: currentUser } = useAuthStore();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchChats();
      fetchPendingRequests();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchChats = async () => {
    const res = await fetch('/api/chats', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setThreads(data);
  };

  const fetchPendingRequests = async () => {
    const res = await fetch('/api/my-requests', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setPendingRequests(data);
  };

  const handleCancelRequest = async (requestId: string) => {
    if (!window.confirm('Cancel this request?')) return;
    await fetch(`/api/requests/${requestId}/cancel`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchPendingRequests();
  };

  return (
    <div className="flex-1 bg-obsidian p-8 overflow-y-auto">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-alabaster tracking-tight">Messages</h1>
        <button onClick={() => navigation.navigate('ACTIVITY')} className="outline-none active:scale-95 transition-transform">
          <div className="bg-lava/40 p-2 rounded-xl border border-white/5">
            <span className="text-[10px] font-bold text-sunstone uppercase tracking-widest">Activity</span>
          </div>
        </button>
      </div>
      
      <div className="space-y-4 pb-20">
        {threads.length === 0 && pendingRequests.length === 0 ? (
          <div className="text-center py-20 text-grey-mist opacity-50">
            <MessageCircle size={48} className="mx-auto mb-4" />
            <p className="font-medium">No conversations yet</p>
          </div>
        ) : (
          <>
            {threads.map((thread) => {
              const isOrganizer = thread.organizer_id === currentUser?.id;
              const otherName = isOrganizer ? thread.participant_name : thread.organizer_name;
              const otherPhoto = isOrganizer ? thread.participant_photo : thread.organizer_photo;
              const otherId = isOrganizer ? thread.participant_id : thread.organizer_id;
              const isEnded = (thread as any).event_status === 'COMPLETED' || (thread as any).event_status === 'CANCELLED';

              return (
                <button 
                  key={thread.id} 
                  className="w-full flex flex-row items-center gap-5 p-5 bg-lava/30 rounded-[2rem] border border-white/5 active:scale-[0.98] transition-transform group outline-none text-left"
                  onClick={() => navigation.navigate('CHAT_THREAD', { 
                    chatId: thread.id,
                    eventTitle: thread.event_title,
                    participantName: otherName,
                    participantPhoto: otherPhoto
                  })}
                >
                  <div className="relative">
                    <img 
                      src={otherPhoto} 
                      className="w-16 h-16 rounded-2xl object-cover border border-white/10" 
                      referrerPolicy="no-referrer" 
                    />
                    {thread.last_message && !thread.seen_at && !isMine(thread, currentUser?.id) && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-sunstone rounded-full border-2 border-obsidian" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-alabaster truncate">{otherName}</h3>
                      {thread.last_message_at && (
                        <span className="text-[10px] font-bold text-grey-mist uppercase tracking-widest">
                          {formatDistanceToNow(new Date(thread.last_message_at), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-sunstone font-bold uppercase tracking-widest mb-1 truncate">{thread.event_title}</p>
                    <p className="text-sm text-grey-mist truncate leading-relaxed">{thread.last_message || 'Start the conversation!'}</p>
                  </div>
                  {isEnded && (thread as any).event_status === 'COMPLETED' && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-sunstone font-bold"
                      onClick={(e: any) => {
                        e.stopPropagation();
                        navigation.navigate('REVIEW_SUBMISSION', {
                          eventId: thread.event_id,
                          revieweeId: otherId,
                          revieweeName: otherName,
                          revieweePhoto: otherPhoto,
                          eventTitle: thread.event_title
                        });
                      }}
                    >
                      Review
                    </Button>
                  )}
                </button>
              );
            })}

            {pendingRequests.length > 0 && (
              <div className="mt-12">
                <h2 className="text-xs font-bold uppercase tracking-widest text-sunstone mb-6 px-4">Pending Requests</h2>
                <div className="space-y-3">
                  {pendingRequests.map((req) => (
                    <div key={req.id} className="flex flex-row items-center gap-4 p-4 bg-lava/20 rounded-[1.5rem] border border-white/5 opacity-60">
                      <img src={req.organizer_photo} className="w-12 h-12 rounded-xl object-cover border border-white/10" referrerPolicy="no-referrer" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-alabaster text-sm truncate">{req.event_title}</h3>
                        <p className="text-xs text-grey-mist">Waiting for {req.organizer_name}...</p>
                      </div>
                      <button onClick={() => handleCancelRequest(req.id)} className="p-2 outline-none active:scale-95 transition-transform">
                        <X size={18} className="text-grey-mist" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
