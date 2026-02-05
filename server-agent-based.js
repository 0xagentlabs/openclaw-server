const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files from the current directory where index.html is located
app.use(express.static(path.join(__dirname)));

// Store connected client
let connectedClient = null;

wss.on('connection', (ws, req) => {
  console.log('New client connected from web interface');
  
  // Only allow one client at a time
  if (connectedClient) {
    ws.send(JSON.stringify({
      type: 'error',
      message: '另一个客户端已连接。请刷新页面重试。'
    }));
    ws.close();
    return;
  }
  
  connectedClient = ws;
  console.log('Web interface client connected successfully');

  ws.on('message', async (message) => {
    console.log('Received message from web interface');
    
    try {
      // Parse the incoming message
      const data = JSON.parse(message.toString());
      
      if (data.type === 'chat_message') {
        const userInput = data.message;
        console.log('Forwarding user input to OpenClaw AI:', userInput);
        
        // Show typing indicator
        if (connectedClient) {
          connectedClient.send(JSON.stringify({
            type: 'typing_start'
          }));
        }
        
        // TRYING DIFFERENT APPROACH: Use --agent flag instead of --session-id
        // Based on the help text, we can use --agent to specify an agent
        const openclawProcess = spawn('openclaw', [
          'agent', 
          '--agent', 'main',  // Use the main agent
          '--message', userInput
        ]);

        let responseText = '';
        let errorOutput = '';

        openclawProcess.stdout.on('data', (data) => {
          responseText += data.toString();
        });

        openclawProcess.stderr.on('data', (data) => {
          errorOutput += data.toString();
        });

        openclawProcess.on('close', (code) => {
          console.log(`OpenClaw agent process exited with code ${code}`);
          
          let finalResponse = responseText.trim();
          
          // If there was an error, return the error message
          if (code !== 0 && errorOutput) {
            finalResponse = `处理您的请求时出现错误: ${errorOutput}`;
          } else if (!finalResponse) {
            // If no response was generated, provide a default
            finalResponse = `已收到您的消息: "${userInput}"`;
          }
          
          console.log('OpenClaw responded with:', finalResponse);
          
          // Send the real OpenClaw response back to the web interface
          if (connectedClient && connectedClient.readyState === WebSocket.OPEN) {
            connectedClient.send(JSON.stringify({
              type: 'chat_response',
              message: finalResponse
            }));
          }
        });
        
      }
    } catch (error) {
      console.error('Error processing message:', error);
      if (connectedClient) {
        connectedClient.send(JSON.stringify({
          type: 'error',
          message: `处理消息时出错: ${error.message}`
        }));
      }
    }
  });

  ws.on('close', () => {
    console.log('Web interface client disconnected');
    if (connectedClient === ws) {
      connectedClient = null;
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    if (connectedClient === ws) {
      connectedClient = null;
    }
  });
});

// Use port 8000 as specified in your setup
const PORT = process.env.PORT || 8000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`OpenClaw WebSocket bridge server listening on port ${PORT}`);
  console.log(`Access the real-time interface at http://localhost:${PORT}`);
  console.log('=== OpenClaw Web Interface - ENHANCED INTERFACE WITH CHAT HISTORY ===');
  console.log('Features: Sidebar with chat history, localStorage persistence, responsive design');
});