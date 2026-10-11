import { io } from 'socket.io-client';

let socketInstance = null;

export const getSocket = (token) => {
  if (!socketInstance && token) {
    // In production, connect directly to backend URL; in local dev with Vite proxy, '/' works
    const backendUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || '';
    const socketUrl = backendUrl ? backendUrl.trim().replace(/\/api\/?$/, '') : '/';

    socketInstance = io(socketUrl, {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
      transports: ['websocket', 'polling']
    });

    socketInstance.on('connect', () => {
      console.log('[Socket Connected] Established real-time channel:', socketInstance.id);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('[Socket Disconnected]', reason);
    });
  }
  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};
