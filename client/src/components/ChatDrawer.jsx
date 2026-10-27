import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Image, User, Check, CheckCheck, MessageSquare, Radio } from 'lucide-react';
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
    <div className="fixed inset-y-0 right-0 z-[1200] w-full sm:w-96 bg-dark-card/95 backdrop-blur-2xl shadow-2xl flex flex-col border-l border-white/[0.08] animate-in slide-in-from-right duration-300 text-slate-100">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-cyan-500/20">
            {recipientName ? recipientName[0].toUpperCase() : 'S'}
          </div>
          <div>
            <h3 className="font-bold text-sm text-white font-display leading-none">
              {recipientName || 'Direct Message'}
            </h3>
            <span className="text-[10px] text-cyan-400 flex items-center gap-1.5 mt-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Encrypted Channel
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-dark-base/50">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
              <MessageSquare size={20} />
            </div>
            <p className="text-xs font-semibold text-slate-400">Secure Direct Message</p>
            <p className="text-[11px] text-slate-500">
              Coordinates, building landmarks, and instructions sent here are saved with this booking.
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.senderId?._id === user?.id || msg.senderId === user?.id;
            return (
              <div
                key={msg._id || index}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm ${
                    isMe
                      ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white rounded-br-none shadow-cyan-500/10'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                  }`}
                >
                  <p className="leading-relaxed">{msg.content}</p>
                </div>
                <span className="text-[9px] text-slate-500 mt-1 px-1 font-mono">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSend} className="p-3.5 bg-dark-card border-t border-white/[0.08] flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type message or landmark..."
          className="flex-1 px-3.5 py-2 text-xs rounded-xl glass-input placeholder:text-slate-500"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-50 text-white transition-all shadow-md shadow-cyan-500/20"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
