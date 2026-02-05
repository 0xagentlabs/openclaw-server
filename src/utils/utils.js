/*
 * Utility Functions
 * Common helper functions for the application
 */

const Utils = {
  // Debounce function to limit frequency of function calls
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle function to ensure function is called at most once per interval
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Format date for display
  formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN');
  },

  // Check if running on mobile
  isMobile() {
    return window.innerWidth <= 768;
  },

  // Scroll to bottom of element
  scrollToBottom(element) {
    element.scrollTop = element.scrollHeight;
  },

  // Generate a random ID
  generateId() {
    return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },

  // Sanitize HTML to prevent XSS
  sanitizeHTML(html) {
    const temp = document.createElement('div');
    temp.textContent = html;
    return temp.innerHTML;
  },

  // Get element by selector with optional parent
  getElement(selector, parent = document) {
    return parent.querySelector(selector);
  },

  // Get all elements by selector with optional parent
  getAllElements(selector, parent = document) {
    return parent.querySelectorAll(selector);
  }
};

// Export for module system (if using modules)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Utils;
}