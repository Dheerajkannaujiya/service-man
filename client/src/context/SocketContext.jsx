import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { getSocket, disconnectSocket } from '../services/socket';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [incomingRequest, setIncomingRequest] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    if (token && user) {
      const sock = getSocket(token);
      setSocket(sock);

      // Listen for incoming provider dispatch requests
      sock.on('booking:dispatch', (data) => {
        console.log('[Socket] Incoming service dispatch:', data);
        setIncomingRequest(data);
      });

      // Listen for real-time notifications
      sock.on('notification:new', (notification) => {
        console.log('[Socket] New notification:', notification);
        setUnreadNotifications((prev) => prev + 1);
      });

      return () => {
        sock.off('booking:dispatch');
        sock.off('notification:new');
      };
    } else {
      disconnectSocket();
      setSocket(null);
      setIncomingRequest(null);
    }
  }, [token, user]);

  const clearIncomingRequest = () => {
    setIncomingRequest(null);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        incomingRequest,
        clearIncomingRequest,
        unreadNotifications,
        setUnreadNotifications
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within a SocketProvider');
  return context;
};
