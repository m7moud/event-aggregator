import WebSocket, { WebSocketServer } from 'ws';
import { Aggregator } from './aggregator.js';
import { config } from './config.js';

function log(...args) {
  if (config.DEBUG_LOGGING) console.log(...args);
}

async function waitForOriginWebSocket() {
  return new Promise((resolve, reject) => {
    const originWS = new WebSocket(config.ORIGIN_SERVICE_URL);

    originWS.on('open', () => {
      log('Connected to origin service');
      resolve(originWS);
    });

    originWS.on('error', (err) => {
      log('Origin WS error:', err.message);
      // Retry after 5 seconds
      setTimeout(
        () => waitForOriginWebSocket().then(resolve).catch(reject),
        5000
      );
    });

    originWS.on('close', (code, reason) => {
      log(
        `Origin connection closed. Code: ${code}, Reason: ${reason.toString()}`
      );
    });
  });
}

async function main() {
  const wss = new WebSocketServer({ port: config.WEBSOCKET_PORT });
  const clients = new Set();

  wss.on('connection', (ws) => {
    console.log('Client connected to aggregator');
    clients.add(ws);

    ws.on('close', () => {
      log('Client disconnected');
      clients.delete(ws);
    });

    ws.on('error', (err) => {
      log('WebSocket error:', err.message);
    });
  });

  // Create aggregator that will push messages to connected clients
  const aggregator = new Aggregator(
    config.AGGREGATION_INTERVAL_MS,
    (aggregatedMessage) => {
      const json = JSON.stringify(aggregatedMessage);
      for (const client of clients) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(json);
        }
      }
    }
  );

  const originWS = await waitForOriginWebSocket();
  originWS.on('message', (data) => {
    try {
      const event = JSON.parse(data);
      aggregator.aggregate(event);
    } catch (err) {
      console.error('Invalid message from origin:', err.message);
    }
  });

  console.log(
    `Event aggregator running on ws://localhost:${config.WEBSOCKET_PORT}`
  );
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
