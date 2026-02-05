/*
 * WebSocket Service
 * Handles WebSocket communication with the server
 */

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.eventHandlers = {};
  }

  // Connect to WebSocket server
  connect() {
    return new Promise((resolve, reject) => {
      try {
        // Use the same protocol as the current page (ws:// or wss://)
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUri = `${protocol}//${window.location.host}`;
        
        this.socket = new WebSocket(wsUri);
        
        this.socket.onopen = (event) => {
          this.isConnected = true;
          this.emit('open', event);
          resolve();
        };
        
        this.socket.onmessage = (event) => {
          this.emit('message', event);
        };
        
        this.socket.onclose = (event) => {
          this.isConnected = false;
          this.emit('close', event);
        };
        
        this.socket.onerror = (error) => {
          this.emit('error', error);
          reject(error);
        };
      } catch (error) {
        console.error('WebSocket connection error:', error);
        reject(error);
      }
    });
  }

  // Send a message
  send(data) {
    if (!this.isConnected || !this.socket) {
      throw new Error('WebSocket is not connected');
    }
    
    this.socket.send(JSON.stringify(data));
  }

  // Register event handlers
  on(event, handler) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(handler);
  }

  // Emit events
  emit(event, data) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event].forEach(handler => handler(data));
    }
  }

  // Close the connection
  close() {
    if (this.socket) {
      this.socket.close();
    }
  }
}

// Export for module system (if using modules)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WebSocketService;
}