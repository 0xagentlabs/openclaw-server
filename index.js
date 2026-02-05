#!/usr/bin/env node

// Simple startup script for OpenClaw Server
const path = require('path');
const { spawn } = require('child_process');

console.log('Starting OpenClaw Server...');
console.log('Loading server from:', __dirname);

// Dynamically import the main server file
try {
  // We'll run the server-agent-based.js file directly
  const serverPath = path.join(__dirname, 'server-agent-based.js');
  
  // Use node to run the server file
  const serverProcess = spawn('node', [serverPath], {
    stdio: 'inherit',
    env: process.env
  });

  serverProcess.on('error', (err) => {
    console.error('Failed to start server:', err);
  });

  serverProcess.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
  });
} catch (error) {
  console.error('Error starting server:', error);
}