import { Strapi } from '@strapi/strapi';

import WebSocket, { WebSocketServer } from 'ws';

export default ({ strapi }: { strapi: Strapi }) => {
  // bootstrap phase

  // get plugin's config object
  const config = strapi.config.get<any>('plugin.strapi-plugin-comfyui');

  // Create a WebSocket server
  const wss = new WebSocketServer({ port: 1388 });

  // Handle WebSocket connection from clients
  wss.on('connection', function connection(clientWs) {
    console.log('Client connected');

    // Create a WebSocket client for the target WebSocket service
    const targetWs = new WebSocket(
      `ws://${config.comfyui.host}:${config.comfyui.port}/ws?clientId=1`
    );

    // Forward messages from clients to the target WebSocket service
    clientWs.on('message', function incoming(message) {
      console.log('Received from client:', message);
      targetWs.send(message);
    });

    // Forward messages from the target WebSocket service to clients
    targetWs.on('message', function incoming(message, isBinary) {
      let newMessage: string | WebSocket.RawData = message;
      if (!isBinary) {
        newMessage = message.toString('utf8');
      }
      console.log('Received from target:', newMessage);
      clientWs.send(newMessage);
    });

    // Handle WebSocket closure
    clientWs.on('close', function close() {
      console.log('Client disconnected');
    });

    // Handle WebSocket errors
    clientWs.on('error', function error(err) {
      console.error('Client error:', err);
    });

    // Handle WebSocket errors for the target WebSocket service
    targetWs.on('error', function error(err) {
      console.error('Target WebSocket service error:', err);
    });

    // Handle WebSocket closure for the target WebSocket service
    targetWs.on('close', function close() {
      console.log('Target WebSocket service disconnected');
    });

    // Handle connection to the target WebSocket service
    targetWs.on('open', function open() {
      console.log('Connected to target WebSocket service');
    });
  });
};
