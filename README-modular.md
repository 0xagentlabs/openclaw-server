# OpenClaw Server - Modular Edition

A complete AI chat server solution that combines the web interface and backend in a single deployable package, with a modular frontend architecture.

## Features

- Real-time WebSocket communication
- Direct integration with OpenClaw AI processing
- Beautiful web interface with responsive design
- Chat history sidebar with localStorage persistence
- Code syntax highlighting for code blocks in messages
- Typing indicators
- Connection status monitoring
- Mobile-responsive layout
- Modular frontend architecture

## Architecture

### Frontend Modules

The frontend is organized into modular components:

#### Components
- `src/components/chat-message.js` - Handles rendering and display of individual chat messages with code block support
- `src/components/chat-history.js` - Manages chat history in localStorage and sidebar UI

#### Services
- `src/services/websocket-service.js` - Handles WebSocket communication with the server

#### Utilities
- `src/utils/utils.js` - Common helper functions (debounce, throttle, etc.)

#### Styles
- `src/styles/code-styles.css` - Syntax highlighting for code blocks in chat messages

#### Application
- `src/app.js` - Main application that orchestrates all components

### Backend
- `server-agent-based.js` - Node.js WebSocket server

## Installation

1. Clone the repository:
```bash
git clone https://github.com/0xagentlabs/openclaw-server.git
cd openclaw-server
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

## Usage

1. The server will start on port 8000 by default
2. Access the web interface at http://localhost:8000
3. The interface will connect to the OpenClaw system automatically
4. Start chatting with the OpenClaw AI through the web interface

## Code Display

The interface automatically detects and formats code blocks in messages using markdown syntax:

```
```javascript
console.log('Hello, world!');
```
```

Inline code is also supported with backticks: `console.log('Hello')`

## Configuration

The server runs on port 8000 by default. You can change this by setting the PORT environment variable:

```bash
PORT=8080 npm start
```

## Requirements

- Node.js and npm
- OpenClaw v2026.2.2 or later
- Access to OpenClaw command line tools