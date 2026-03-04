// src/store/chatStore.ts
import { create } from 'zustand';
import { Message } from '../types';

interface ChatState {
  messages: Record<string, Message[]>; // keyed by chatId
  unreadCount: number;
  addMessage: (chatId: string, message: Message) => void;
  setMessages: (chatId: string, messages: Message[]) => void;
  markRead: (chatId: string) => void;
  setUnreadCount: (count: number) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: {},
  unreadCount: 0,
  addMessage: (chatId, message) => set((state) => {
    const chatMessages = state.messages[chatId] || [];
    // Avoid duplicates
    if (chatMessages.some(m => m.id === message.id)) return state;
    return {
      messages: {
        ...state.messages,
        [chatId]: [...chatMessages, message],
      },
      unreadCount: state.unreadCount + 1,
    };
  }),
  setMessages: (chatId, messages) => set((state) => ({
    messages: {
      ...state.messages,
      [chatId]: messages,
    },
  })),
  markRead: (chatId) => set((state) => ({
    unreadCount: Math.max(0, state.unreadCount - (state.messages[chatId]?.filter(m => !m.read).length || 0)),
  })),
  setUnreadCount: (count) => set({ unreadCount: count }),
}));
