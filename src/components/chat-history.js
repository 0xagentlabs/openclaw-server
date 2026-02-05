/*
 * Chat History Component
 * Manages chat history in localStorage and sidebar UI
 */

class ChatHistory {
  constructor() {
    this.storageKey = 'openclawChatHistory';
    this.maxChats = 20;
  }

  // Load chat history from localStorage
  load() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading chat history:', error);
      return [];
    }
  }

  // Save chat history to localStorage
  save(chats) {
    try {
      // Limit to maxChats
      if (chats.length > this.maxChats) {
        chats = chats.slice(0, this.maxChats);
      }
      localStorage.setItem(this.storageKey, JSON.stringify(chats));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }

  // Add a new chat
  add(chat) {
    const chats = this.load();
    chat.timestamp = Date.now();
    chats.unshift(chat);
    this.save(chats);
    return chat;
  }

  // Update an existing chat
  update(chatId, updatedData) {
    const chats = this.load();
    const index = chats.findIndex(chat => chat.id === chatId);
    if (index !== -1) {
      chats[index] = { ...chats[index], ...updatedData, timestamp: Date.now() };
      this.save(chats);
    }
  }

  // Delete a chat
  delete(chatId) {
    const chats = this.load();
    const filteredChats = chats.filter(chat => chat.id !== chatId);
    this.save(filteredChats);
    return filteredChats;
  }

  // Clear all history
  clear() {
    localStorage.removeItem(this.storageKey);
  }

  // Format date for display
  formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN');
  }
}

// Export for module system (if using modules)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChatHistory;
}