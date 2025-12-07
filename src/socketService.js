import { Platform } from 'react-native';
import { io } from 'socket.io-client';

// Use your computer's IP address for iOS simulator and physical devices
// For web, use localhost
const isWeb = typeof window !== 'undefined' && window.document;
const SOCKET_URL = isWeb
  ? 'http://localhost:4000' 
  : 'http://10.20.16.208:4000';

console.log('Platform.OS:', Platform.OS, 'isWeb:', isWeb, 'SOCKET_URL:', SOCKET_URL);

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect() {
    if (this.socket && this.connected) {
      console.log('Socket already connected');
      return Promise.resolve(this.socket);
    }

    console.log('Connecting to socket server:', SOCKET_URL);
    
    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
      timeout: 10000,
    });

    return new Promise((resolve, reject) => {
      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket.id);
        this.connected = true;
        resolve(this.socket);
      });

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
        this.connected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
        reject(error);
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        if (!this.connected) {
          reject(new Error('Connection timeout'));
        }
      }, 10000);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  joinRoom(roomId) {
    if (this.socket) {
      console.log('Attempting to join room:', roomId, 'Socket connected:', this.connected);
      this.socket.emit('join-room', roomId);
    } else {
      console.error('Cannot join room - socket not initialized');
    }
  }

  sendMessage(roomId, message) {
    if (this.socket && this.connected) {
      console.log('Emitting message to server:', { roomId, message });
      this.socket.emit('send-message', { roomId, message });
    } else {
      console.error('Cannot send message - socket not connected. Connected:', this.connected);
    }
  }

  pinMessage(roomId, messageId) {
    if (this.socket && this.connected) {
      console.log('Pinning message:', { roomId, messageId });
      this.socket.emit('pin-message', { roomId, messageId });
    } else {
      console.error('Cannot pin - socket not connected');
    }
  }

  unpinMessage(roomId, messageId) {
    if (this.socket && this.connected) {
      console.log('Unpinning message:', { roomId, messageId });
      this.socket.emit('unpin-message', { roomId, messageId });
    } else {
      console.error('Cannot unpin - socket not connected');
    }
  }

  deleteMessages(roomId, messageIds) {
    if (this.socket && this.connected) {
      console.log('Deleting messages:', { roomId, messageIds });
      this.socket.emit('delete-messages', { roomId, messageIds });
    } else {
      console.error('Cannot delete - socket not connected');
    }
  }

  addReaction(roomId, messageId, emoji, userId) {
    if (this.socket) {
      this.socket.emit('add-reaction', { roomId, messageId, emoji, userId });
    }
  }

  onRoomMessages(callback) {
    if (this.socket) {
      this.socket.on('room-messages', callback);
    }
  }

  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('new-message', callback);
    }
  }

  onPinnedMessages(callback) {
    if (this.socket) {
      this.socket.on('pinned-messages', callback);
    }
  }

  onMessagePinned(callback) {
    if (this.socket) {
      this.socket.on('message-pinned', callback);
    }
  }

  onMessageUnpinned(callback) {
    if (this.socket) {
      this.socket.on('message-unpinned', callback);
    }
  }

  onReactionAdded(callback) {
    if (this.socket) {
      this.socket.on('reaction-added', callback);
    }
  }

  onMessagesDeleted(callback) {
    if (this.socket) {
      this.socket.on('messages-deleted', callback);
    }
  }

  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

export default new SocketService();
