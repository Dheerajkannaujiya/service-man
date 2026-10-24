import { io } from 'socket.io-client';
import { mockEventBus } from './mockService';

let socketInstance = null;
let mockSocket = null;

// Create a robust hybrid socket wrapper that supports both live server and mock real-time events
const createMockSocket = () => {
  const listeners = new Map();

  return {
    id: 'mock_socket_session',
    connected: true,
    on: (event, callback) => {
      if (!listeners.has(event)) {
        listeners.set(event, []);
      }
      listeners.get(event).push(callback);
      // Also register with mockEventBus
      mockEventBus.on(event, callback);
    },
    off: (event, callback) => {
      mockEventBus.off(event, callback);
      if (!listeners.has(event)) return;
      if (!callback) {
        listeners.delete(event);
      } else {
        const arr = listeners.get(event).filter((cb) => cb !== callback);
        listeners.set(event, arr);
      }
    },
    emit: (event, data) => {
      console.log(`[Simulated Socket Emit] ${event}:`, data);
      // Map simulated location update to listener
      if (event === 'provider:location' && data) {
        mockEventBus.emit('booking:location_update', data);
      } else if (event === 'booking:join' || event === 'booking:leave') {
        // Room join/leave simulation
      } else {
        mockEventBus.emit(event, data);
      }
    },
    disconnect: () => {
      listeners.clear();
    }
  };
};

export const getSocket = (token) => {
  if (!token) return null;

  if (!socketInstance) {
    try {
      const backendUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || '';
      const socketUrl = backendUrl ? backendUrl.trim().replace(/\/api\/?$/, '') : '/';

      socketInstance = io(socketUrl, {
        auth: { token },
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 2000,
        timeout: 4000,
        transports: ['websocket', 'polling']
      });

      socketInstance.on('connect', () => {
        console.log('[Socket Connected] Established real-time channel:', socketInstance.id);
      });

      socketInstance.on('connect_error', () => {
        // Silently handle fallback
      });

      // Hook up mockEventBus so components listening to socketInstance also get mock bus events
      const originalOn = socketInstance.on.bind(socketInstance);
      const originalOff = socketInstance.off.bind(socketInstance);
      const originalEmit = socketInstance.emit.bind(socketInstance);

      socketInstance.on = (event, callback) => {
        originalOn(event, callback);
        mockEventBus.on(event, callback);
        return socketInstance;
      };

      socketInstance.off = (event, callback) => {
        originalOff(event, callback);
        mockEventBus.off(event, callback);
        return socketInstance;
      };

      socketInstance.emit = (event, ...args) => {
        originalEmit(event, ...args);
        mockEventBus.emit(event, args[0]);
        return socketInstance;
      };
    } catch (e) {
      console.warn('[Socket] Using mock socket fallback');
      mockSocket = createMockSocket();
      return mockSocket;
    }
  }

  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    try {
      socketInstance.disconnect();
    } catch (e) {}
    socketInstance = null;
  }
  if (mockSocket) {
    try {
      mockSocket.disconnect();
    } catch (e) {}
    mockSocket = null;
  }
};
