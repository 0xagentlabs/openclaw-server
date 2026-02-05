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
  console.log('New client connection attempt from:', req.socket.remoteAddress);
  
  // Log the previous client if exists
  if (connectedClient) {
    console.log('Previous client was still connected, replacing it');
  }
  
  // Disconnect previous client if exists
  if (connectedClient) {
    try {
      connectedClient.close();
    } catch (e) {
      console.log('Could not close previous client connection:', e.message);
    }
  }
  
  connectedClient = ws;
  console.log('Web interface client connected successfully');
  
  connectedClient = ws;
  console.log('Web interface client connected successfully');

  ws.on('message', async (message) => {
    console.log('Received message from web interface');
    
    try {
      // Parse the incoming message
      const data = JSON.parse(message.toString());
      console.log('Parsed message type:', data.type);
      
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
          console.log('OpenClaw stdout:', data.toString());
          responseText += data.toString();
        });

        openclawProcess.stderr.on('data', (data) => {
          console.error('OpenClaw stderr:', data.toString());
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

  ws.on('close', (code, reason) => {
    console.log('Web interface client disconnected. Code:', code, 'Reason:', reason?.toString());
    if (connectedClient === ws) {
      connectedClient = null;
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    console.error('Error details:', error.message, error.stack);
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