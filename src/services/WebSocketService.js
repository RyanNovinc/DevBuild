// src/services/WebSocketService.js
class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.messageHandlers = new Map();
    this.connectionHandlers = new Set();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimeout = null;
  }

  // Connect to the WebSocket server
  connect(url) {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      console.log('WebSocket is already connected or connecting');
      return;
    }

    console.log('Connecting to WebSocket:', url);
    
    try {
      this.socket = new WebSocket(url);
      
      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.notifyConnectionHandlers('connected');
      };
      
      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      this.socket.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.isConnected = false;
        this.notifyConnectionHandlers('disconnected');
        
        // Attempt to reconnect
        this.attemptReconnect(url);
      };
      
      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.notifyConnectionHandlers('error', error);
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
    }
  }
  
  // Attempt to reconnect
  attemptReconnect(url) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
      
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = setTimeout(() => {
        this.connect(url);
      }, delay);
    } else {
      console.log('Max reconnect attempts reached');
      this.notifyConnectionHandlers('maxReconnectAttemptsReached');
    }
  }
  
  // Disconnect from the WebSocket server
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.isConnected = false;
      
      // Clear reconnection attempts
      clearTimeout(this.reconnectTimeout);
      this.reconnectAttempts = 0;
    }
  }
  
  // Send a message to the WebSocket server
  sendMessage(action, data) {
    if (!this.isConnected) {
      console.error('Cannot send message: WebSocket is not connected');
      return false;
    }
    
    try {
      const message = JSON.stringify({
        action,
        ...data
      });
      
      this.socket.send(message);
      return true;
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      return false;
    }
  }
  
  // Handle incoming messages
  handleMessage(data) {
    console.log('Received WebSocket message:', data);
    
    // Get the message type
    const type = data.type;
    
    // Call all handlers for this type
    if (this.messageHandlers.has(type)) {
      const handlers = this.messageHandlers.get(type);
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in message handler for type '${type}':`, error);
        }
      });
    }
    
    // Call all handlers for 'all' type
    if (this.messageHandlers.has('all')) {
      const handlers = this.messageHandlers.get('all');
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error('Error in generic message handler:', error);
        }
      });
    }
  }
  
  // Add a message handler
  addMessageHandler(type, handler) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }
    
    this.messageHandlers.get(type).add(handler);
    
    // Return a function to remove this handler
    return () => {
      this.removeMessageHandler(type, handler);
    };
  }
  
  // Remove a message handler
  removeMessageHandler(type, handler) {
    if (this.messageHandlers.has(type)) {
      this.messageHandlers.get(type).delete(handler);
    }
  }
  
  // Add a connection handler
  addConnectionHandler(handler) {
    this.connectionHandlers.add(handler);
    
    // Return a function to remove this handler
    return () => {
      this.removeConnectionHandler(handler);
    };
  }
  
  // Remove a connection handler
  removeConnectionHandler(handler) {
    this.connectionHandlers.delete(handler);
  }
  
  // Notify all connection handlers
  notifyConnectionHandlers(status, data) {
    this.connectionHandlers.forEach(handler => {
      try {
        handler(status, data);
      } catch (error) {
        console.error(`Error in connection handler for status '${status}':`, error);
      }
    });
  }
}

// Create a singleton instance
const webSocketService = new WebSocketService();

export default webSocketService;