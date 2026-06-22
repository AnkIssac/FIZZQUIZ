import { io } from 'socket.io-client';

// Single shared socket connection (lazy). In dev, Vite proxies /socket.io to :3001.
let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io('/', {
      autoConnect: true,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}

// Promise wrapper for events that use an acknowledgement callback.
export function emitWithAck(event, payload) {
  return new Promise((resolve) => {
    getSocket().emit(event, payload, (response) => resolve(response));
  });
}
