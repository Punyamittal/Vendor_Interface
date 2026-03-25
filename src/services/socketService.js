import { io } from 'socket.io-client';
import { SOCKET_EVENTS } from '../constants/socketEvents';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  socket = null;
  connected = false;
  pendingEmits = [];

  init(token) {
    if (this.socket) return;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      this.connected = true;
      console.log('Connected to socket server');

      // Flush any emits that happened before the connection was ready.
      if (this.pendingEmits.length) {
        const queued = [...this.pendingEmits];
        this.pendingEmits = [];
        queued.forEach(({ event, data }) => this.socket.emit(event, data));
      }
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
      console.log('Disconnected from socket server');
    });

    this.socket.on('connect_error', (err) => {
      this.connected = false;
      console.error('Socket connect_error:', err);
    });
  }

  on(event, callback) {
    if (!this.socket) return;
    this.socket.on(event, callback);
  }

  off(event) {
    if (!this.socket) return;
    this.socket.off(event);
  }

  emit(event, data) {
    if (!this.socket) return;

    // If the socket isn't connected yet, queue the message to avoid
    // "send was called before connect" errors from the underlying transport.
    if (!this.connected || !this.socket.connected) {
      this.pendingEmits.push({ event, data });
      return;
    }

    this.socket.emit(event, data);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.connected = false;
    this.pendingEmits = [];
  }
}

export const socketService = new SocketService();
