// src/screens/chats/ChatThreadScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { ChevronLeft, MoreVertical, Send } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useSocket } from '../../hooks/useSocket';
import { cn, type Message } from '../../types';

export const ChatThreadScreen = ({ route, navigation }: any) => {
  const { chatId, eventTitle, participantName, participantPhoto } = route.params;
  const { token, user: currentUser } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { messages: socketMessages, sendMessage } = useSocket(token);
  const userId = currentUser?.id;
  const isEnded = false; // Placeholder

  useEffect(() => {
    fetchMessages();
  }, [chatId]);

  useEffect(() => {
    const newMsgs = socketMessages.filter(m => m.thread_id === chatId && !messages.find(existing => existing.id === m.id));
    if (newMsgs.length > 0) {
      setMessages(prev => [...prev, ...newMsgs]);
    }
  }, [socketMessages]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const fetchMessages = async () => {
    const res = await fetch(`/api/chats/${chatId}/messages`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setMessages(data);
  };

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isEnded) return;
    sendMessage(chatId, input);
    setInput('');
  };

  return (
    <div className="flex-1 bg-obsidian flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-white/5 flex items-center gap-4 bg-obsidian/50 backdrop-blur-xl">
        <button onClick={() => navigation.goBack()} className="p-2 text-grey-mist hover:text-alabaster transition-colors outline-none"><ChevronLeft size={24} /></button>
        <img src={participantPhoto} className="w-12 h-12 rounded-2xl object-cover border border-white/10 shadow-lg" referrerPolicy="no-referrer" />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-alabaster truncate">{participantName}</h3>
          <p className="text-[10px] text-sunstone font-bold uppercase tracking-widest">{eventTitle}</p>
        </div>
        <button className="p-2 text-grey-mist hover:text-alabaster transition-colors outline-none"><MoreVertical size={20} /></button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 bg-obsidian">
        {messages.map((msg) => {
          const isMine = msg.sender_id === userId;
          return (
            <div key={msg.id} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
              <div className={cn(
                'max-w-[85%] px-5 py-3.5 rounded-[2rem] text-sm shadow-xl relative',
                isMine 
                  ? 'bg-sunstone text-white rounded-tr-none shadow-sunstone/20' 
                  : 'bg-lava text-alabaster rounded-tl-none border border-white/5'
              )}>
                <p className="leading-relaxed">{msg.content}</p>
                <p className={cn('text-[10px] font-bold uppercase tracking-widest mt-2 opacity-50', isMine ? 'text-white' : 'text-grey-mist')}>
                  {format(new Date(msg.created_at), 'h:mm a')}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {!isEnded && (
        <div className="p-6 border-t border-white/5 flex flex-row gap-4 bg-obsidian/50 backdrop-blur-xl">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-6 py-4 bg-lava/50 border border-white/10 rounded-full text-alabaster placeholder:text-grey-mist/30 focus:outline-none focus:ring-2 focus:ring-sunstone/20 focus:border-sunstone transition-all"
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="w-14 h-14 bg-sunstone text-white rounded-full flex items-center justify-center shadow-xl shadow-sunstone/30 disabled:opacity-50 disabled:shadow-none hover:scale-105 active:scale-95 transition-all outline-none"
          >
            <Send size={24} />
          </button>
        </div>
      )}
    </div>
  );
};
