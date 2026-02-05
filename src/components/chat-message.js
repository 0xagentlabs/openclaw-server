/* 
 * Chat Message Component
 * Handles rendering and display of individual chat messages
 */

class ChatMessage {
  constructor(text, sender) {
    this.text = text;
    this.sender = sender;
    this.timestamp = new Date();
  }

  // Detect if message contains code blocks
  containsCode() {
    return /```[\s\S]*?```/.test(this.text) || /^```[\s\S]*?$/.test(this.text);
  }

  // Format message text, handling code blocks specially
  formatText() {
    let formattedText = this.text;

    // Handle code blocks in markdown format
    formattedText = formattedText.replace(/```([\s\S]*?)```/g, (match, code) => {
      // Detect language if specified
      const langMatch = match.match(/```(\w+)/);
      const lang = langMatch ? langMatch[1] : 'text';
      const codeContent = match.replace(/```(\w+\n)?/, '').replace(/```\s*$/, '');
      
      return `<pre><code class="language-${lang}">${this.escapeHtml(codeContent)}</code></pre>`;
    });

    // Handle inline code
    formattedText = formattedText.replace(/`(.*?)`/g, '<code>$1</code>');

    // Handle other markdown elements (basic support)
    // Bold: **text** or __text__
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formattedText = formattedText.replace(/__(.*?)__/g, '<strong>$1</strong>');
    
    // Italic: *text* or _text_
    formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formattedText = formattedText.replace(/_(.*?)_/g, '<em>$1</em>');
    
    // Links: [text](url)
    formattedText = formattedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // Headers: # Header
    formattedText = formattedText.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    formattedText = formattedText.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    formattedText = formattedText.replace(/^# (.*$)/gm, '<h1>$1</h1>');

    // Line breaks
    formattedText = formattedText.replace(/\n/g, '<br>');

    return formattedText;
  }

  // Escape HTML to prevent XSS
  escapeHtml(text) {
    if (typeof text !== 'string') return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Render the message element
  render() {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${this.sender}-message`;
    
    // Apply formatted text
    messageEl.innerHTML = this.formatText();
    
    return messageEl;
  }
}

// Export for module system (if using modules)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChatMessage;
}