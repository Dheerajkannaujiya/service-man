import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Image, User, Check, CheckCheck } from 'lucide-react';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

export default function ChatDrawer({ bookingId, recipientName, isOpen, onClose }) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && bookingId) {
      loadMessages();
      if (socket) {
        socket.emit('booking:join', { bookingId });
      }
    }

    return () => {
      if (socket && bookingId) {
        socket.emit('booking:leave', { bookingId });
      }
    };
  }, [isOpen, bookingId, socket]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      if (msg.bookingId === bookingId) {
        setMessages((prev) => {
          // Prevent duplicates
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        scrollToBottom();
      }
    };

    socket.on('chat:new_message', handleNewMessage);

    return () => {
      socket.off('chat:new_message', handleNewMessage);
    };
  }, [socket, bookingId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const res = await api.get(`/chat/${bookingId}`);
      if (res.data.success) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      console.warn('Failed to load chat history:', err.message);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;

    const content = text.trim();
    setText('');
    setSending(true);

    try {
      const res = await api.post(`/chat/${bookingId}`, { content });
      if (res.data.success) {
        // Optimistically add if not already received via socket
        setMessages((prev) => {
          if (prev.some((m) => m._id === res.data.message._id)) return prev;
          return [...prev, res.data.message];
        });
        scrollToBottom();
      }
    } catch (err) {
      console.error('Failed to send message:', err.message);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-[1200] w-full sm:w-96 bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 bg-brand-600 text-white flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
            {recipientName ? recipientName[0].toUpperCase() : 'S'}
          </div>
          <div>
            <h3 className="font-semibold text-sm leading-none">{recipientName || 'Direct Message'}</h3>
            <span className="text-[11px] text-blue-100 flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Live Socket Connected
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white"
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center text-xs px-4">
            <User size={32} className="mb-2 text-slate-300" />
            <p className="font-medium">Direct Booking Channel</p>
            <p className="mt-1">Messages are end-to-end encrypted and visible only to you and your assigned professional.</p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.senderId?._id === user?.id || m.senderId === user?.id;
            return (
              <div
                key={m._id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[82%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed shadow-sm ${
                    isMe
                      ? 'bg-brand-600 text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                  }`}
                >
                  <p>{m.content}</p>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1 flex items-center gap-1">
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {isMe && (m.isRead ? <CheckCheck size={11} className="text-blue-500" /> : <Check size={11} />)}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="p-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50 transition-colors focus:outline-none"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
