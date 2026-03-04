import { useState, useEffect, useCallback, useRef } from 'react';

export function useSocket(token: string | null) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}`);

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'auth', token }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new_message') {
        setMessages((prev) => [...prev, data.message]);
      }
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [token]);

  const sendMessage = useCallback((threadId: string, content: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'chat_message', threadId, content }));
    }
  }, [socket]);

  return { socket, messages, setMessages, sendMessage };
}
