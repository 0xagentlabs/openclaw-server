/*
 * Main Application
 * Orchestrates all components and manages the chat interface
 */

class OpenClawApp {
  constructor() {
    this.currentChatId = null;
    this.currentChatTitle = null;
    
    // Initialize components
    this.chatHistory = new ChatHistory();
    this.webSocketService = new WebSocketService();
    this.utils = Utils;
    
    // DOM Elements
    this.chatContainer = document.getElementById('chat-container');
    this.messageInput = document.getElementById('message-input');
    this.sendButton = document.getElementById('send-button');
    this.typingIndicator = document.getElementById('typing-indicator');
    this.connectionStatus = document.getElementById('connection-status');
    this.statusIndicator = document.getElementById('status-indicator');
    this.errorMessage = document.getElementById('error-message');
    this.chatHistoryList = document.getElementById('chat-history-list');
    this.newChatBtn = document.getElementById('new-chat-btn');
    this.sidebar = document.getElementById('sidebar');
    this.sidebarToggle = document.getElementById('sidebar-toggle');
    
    // Bind methods
    this.init = this.init.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.addMessage = this.addMessage.bind(this);
    this.loadChat = this.loadChat.bind(this);
    this.createNewChat = this.createNewChat.bind(this);
    this.deleteChat = this.deleteChat.bind(this);
    
    // Initialize the app
    this.init();
  }

  async init() {
    try {
      // Initialize with a default chat if none exists
      if (!this.currentChatId) {
        this.currentChatId = this.utils.generateId();
        this.currentChatTitle = '新对话';
      }
      
      // Load chat history
      this.loadChatHistory();
      
      // Initialize WebSocket connection
      await this.initWebSocket();
      
      // Set up event listeners
      this.setupEventListeners();
      
      console.log('OpenClaw App initialized successfully');
    } catch (error) {
      console.error('Error initializing OpenClaw App:', error);
    }
  }

  setupEventListeners() {
    // Send button
    this.sendButton.addEventListener('click', this.sendMessage);
    
    // Message input
    this.messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
    
    // New chat button
    this.newChatBtn.addEventListener('click', this.createNewChat);
    
    // Sidebar toggle for mobile
    this.sidebarToggle.addEventListener('click', () => {
      this.sidebar.classList.toggle('active');
    });
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (event) => {
      const isClickInsideSidebar = this.sidebar.contains(event.target);
      const isClickOnToggle = this.sidebarToggle.contains(event.target);
      
      if (!isClickInsideSidebar && !isClickOnToggle && this.utils.isMobile()) {
        this.sidebar.classList.remove('active');
      }
    });
    
    // Handle page unload
    window.onbeforeunload = () => {
      this.saveCurrentChat();
      if (this.webSocketService.socket) {
        this.webSocketService.socket.close();
      }
    };
    
    // Handle visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.saveCurrentChat();
      }
    });
  }

  async initWebSocket() {
    try {
      await this.webSocketService.connect();
      
      // Set up message handlers
      this.webSocketService.on('open', (event) => {
        console.log('WebSocket connection established');
        this.updateConnectionStatus(true);
        this.enableInput();
        if (this.chatContainer.children.length <= 1) { // Only add welcome message if it's a new session
          this.addMessage('已连接到本地OpenClaw实例。现在您可以开始聊天了。', 'assistant');
        }
      });
      
      this.webSocketService.on('message', (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'chat_response') {
            this.addMessage(data.message, 'assistant');
            this.hideTypingIndicator();
          } else if (data.type === 'typing_start') {
            this.showTypingIndicator();
          } else if (data.type === 'error') {
            this.addMessage(`错误: ${data.message}`, 'assistant');
            this.hideTypingIndicator();
          }
        } catch (error) {
          console.error('Error parsing message:', error);
          this.addMessage('收到无法解析的消息', 'assistant');
          this.hideTypingIndicator();
        }
      });
      
      this.webSocketService.on('close', (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        this.updateConnectionStatus(false);
        this.disableInput();
        this.addMessage('与本地OpenClaw实例的连接已断开。正在尝试重连...', 'assistant');
        // Attempt to reconnect after a delay
        setTimeout(() => {
          this.initWebSocket();
        }, 3000);
      });
      
      this.webSocketService.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.updateConnectionStatus(false);
        this.showError('WebSocket连接错误: ' + error.message);
      });
      
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      this.showError('无法建立WebSocket连接: ' + error.message);
    }
  }

  // Update connection status display
  updateConnectionStatus(connected) {
    if (connected) {
      this.statusIndicator.className = 'status-indicator status-connected';
      this.connectionStatus.textContent = '已连接';
    } else {
      this.statusIndicator.className = 'status-indicator status-disconnected';
      this.connectionStatus.textContent = '未连接';
    }
  }

  // Enable input fields
  enableInput() {
    this.messageInput.disabled = false;
    this.sendButton.disabled = false;
    this.messageInput.placeholder = '输入您的消息... (按 Enter 发送，按 Shift+Enter 换行)';
    this.hideError();
  }

  // Disable input fields
  disableInput() {
    this.messageInput.disabled = true;
    this.sendButton.disabled = true;
    this.messageInput.placeholder = '连接中...';
  }

  // Show error message
  showError(message) {
    this.errorMessage.textContent = message;
    this.errorMessage.style.display = 'block';
  }

  // Hide error message
  hideError() {
    this.errorMessage.style.display = 'none';
  }

  // Add message to chat container and save to current chat
  addMessage(message, sender) {
    this.addMessageToDOM(message, sender, true);
    this.saveCurrentChat();
  }

  // Add message to DOM only
  addMessageToDOM(message, sender, scrollToBottom = true) {
    // Create a new ChatMessage instance and render it
    const chatMessage = new ChatMessage(message, sender);
    const messageElement = chatMessage.render();
    this.chatContainer.appendChild(messageElement);
    
    // Scroll to bottom if requested
    if (scrollToBottom) {
      this.utils.scrollToBottom(this.chatContainer);
    }
  }

  // Show typing indicator
  showTypingIndicator() {
    this.typingIndicator.style.display = 'block';
    this.utils.scrollToBottom(this.chatContainer);
  }

  // Hide typing indicator
  hideTypingIndicator() {
    this.typingIndicator.style.display = 'none';
  }

  // Send message via WebSocket
  sendMessage() {
    const message = this.messageInput.value.trim();
    if (!message || !this.webSocketService.isConnected) return;
    
    // Add user message to chat
    this.addMessage(message, 'user');
    
    // Update chat title if this is the first user message in the chat
    if (!this.currentChatTitle || this.currentChatTitle === '新对话' || this.currentChatTitle === '未命名对话') {
      this.updateChatTitle(message);
    }
    
    // Clear input and disable button
    this.messageInput.value = '';
    this.sendButton.disabled = true;
    
    // Send message via WebSocket
    const data = {
      type: 'chat_message',
      message: message
    };
    
    try {
      this.webSocketService.send(data);
    } catch (error) {
      console.error('Error sending message:', error);
      this.addMessage(`发送消息时出错: ${error.message}`, 'assistant');
      this.hideTypingIndicator();
    }
  }

  // Update chat title based on first user message
  updateChatTitle(firstUserMessage) {
    if (this.currentChatId && (!this.currentChatTitle || this.currentChatTitle === '新对话' || this.currentChatTitle === '未命名对话')) {
      // Use the first 30 characters of the first user message as the title
      this.currentChatTitle = firstUserMessage.length > 30 ? 
        firstUserMessage.substring(0, 30) + '...' : 
        firstUserMessage;
      this.chatHistory.update(this.currentChatId, { title: this.currentChatTitle });
      this.loadChatHistory(); // Refresh the UI
    }
  }

  // Load chat history from localStorage
  loadChatHistory() {
    const chatHistory = this.chatHistory.load();
    this.chatHistoryList.innerHTML = '';
    
    chatHistory.forEach(chat => {
      const chatItem = document.createElement('div');
      chatItem.classList.add('chat-history-item');
      if (chat.id === this.currentChatId) {
        chatItem.classList.add('active');
      }
      chatItem.dataset.chatId = chat.id;
      chatItem.innerHTML = `
        <div class="chat-info">
          <span class="chat-title">${chat.title || '未命名对话'}</span>
          <span class="timestamp">${this.utils.formatDate(chat.timestamp)}</span>
        </div>
        <button class="delete-btn" onclick="app.deleteChat('${chat.id}', event)">×</button>
      `;
      chatItem.addEventListener('click', (e) => {
        // Don't trigger loadChat if the delete button was clicked
        if (!e.target.classList.contains('delete-btn')) {
          this.loadChat(chat.id);
        }
      });
      this.chatHistoryList.appendChild(chatItem);
    });
  }

  // Load a chat by ID
  loadChat(chatId) {
    // Save current chat before switching
    this.saveCurrentChat();
    
    const chatHistory = this.chatHistory.load();
    const chat = chatHistory.find(c => c.id === chatId);
    
    if (chat) {
      this.currentChatId = chat.id;
      this.currentChatTitle = chat.title;
      
      // Clear current chat container and load saved messages
      this.chatContainer.innerHTML = '';
      chat.messages.forEach(msg => {
        this.addMessageToDOM(msg.text, msg.sender, false); // Don't scroll to bottom when loading
      });
      
      this.updateActiveChatItem();
    }
  }

  // Save current chat to localStorage
  saveCurrentChat() {
    if (!this.currentChatId) return;
    
    // Get current messages from the chat container
    const messages = [];
    const messageElements = this.chatContainer.querySelectorAll('.message');
    
    messageElements.forEach(element => {
      let sender = 'assistant';
      if (element.classList.contains('user-message')) {
        sender = 'user';
      }
      messages.push({
        text: element.textContent,
        sender: sender,
        timestamp: Date.now()
      });
    });
    
    const chatHistory = this.chatHistory.load();
    const existingChatIndex = chatHistory.findIndex(c => c.id === this.currentChatId);
    
    if (existingChatIndex !== -1) {
      // Update existing chat
      this.chatHistory.update(this.currentChatId, {
        id: this.currentChatId,
        title: this.currentChatTitle || '未命名对话',
        messages: messages,
        timestamp: Date.now()
      });
    } else {
      // Add new chat
      this.chatHistory.add({
        id: this.currentChatId,
        title: this.currentChatTitle || '未命名对话',
        messages: messages,
        timestamp: Date.now()
      });
    }
  }

  // Update the active chat item in the sidebar
  updateActiveChatItem() {
    // Remove active class from all items
    this.utils.getAllElements('.chat-history-item').forEach(item => {
      item.classList.remove('active');
    });
    
    // Add active class to current chat
    const currentItem = this.utils.getElement(`.chat-history-item[data-chat-id="${this.currentChatId}"]`);
    if (currentItem) {
      currentItem.classList.add('active');
    }
  }

  // Create a new chat
  createNewChat() {
    // Save current chat before switching
    this.saveCurrentChat();
    
    // Create new chat
    this.currentChatId = this.utils.generateId();
    this.currentChatTitle = '新对话';
    this.chatContainer.innerHTML = '<div class="message assistant-message">您好！这是一个新的对话。</div>';
    
    // Update UI
    this.updateActiveChatItem();
    
    // Add to history
    this.chatHistory.add({
      id: this.currentChatId,
      title: this.currentChatTitle,
      messages: [{ text: '您好！这是一个新的对话。', sender: 'assistant', timestamp: Date.now() }]
    });
    
    this.loadChatHistory(); // Refresh the UI
  }

  // Delete a chat by ID
  deleteChat(chatId, event) {
    event.stopPropagation(); // Prevent triggering the chat load event
    
    if (confirm('确定要删除这个对话吗？')) {
      // Remove the chat from history
      this.chatHistory.delete(chatId);
      
      // If we're deleting the currently active chat, reset to a new chat
      if (this.currentChatId === chatId) {
        this.currentChatId = null;
        this.currentChatTitle = null;
        this.createNewChat(); // Create a new chat to replace the deleted one
      }
      
      // Reload the chat history in the sidebar
      this.loadChatHistory();
    }
  }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
  // Initialize with a default chat if none exists
  window.app = new OpenClawApp();
});