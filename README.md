# OpenClaw Server

A complete AI chat server solution that combines the web interface and backend in a single deployable package.

## Features

- Real-time WebSocket communication
- Direct integration with OpenClaw AI processing
- Beautiful web interface with responsive design
- Chat history sidebar with localStorage persistence
- Typing indicators
- Connection status monitoring
- Mobile-responsive layout

## Installation

1. Clone the repository:
```bash
git clone https://github.com/v1xingyue/openclaw-server.git
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

## Configuration

The server runs on port 8000 by default. You can change this by setting the PORT environment variable:

```bash
PORT=8080 npm start
```

## Architecture

- Frontend: HTML/CSS/JavaScript client-side interface with chat history functionality
- Backend: Node.js WebSocket server
- Integration: Uses OpenClaw's agent command to process messages through the real AI system
- Communication: Real-time WebSocket connection between browser and server
- Storage: Client-side localStorage for chat history

## Requirements

- Node.js and npm
- OpenClaw v2026.2.2 or later
- Access to OpenClaw command line tools