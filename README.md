# Event Aggregator

A Node.js WebSocket service that aggregates events by serial number and broadcasts them to connected clients.

## Features

- Waits for and maintains a connection to the upstream WebSocket source, retrying on failure
- Aggregates incoming events over a configurable time interval
- Broadcasts aggregated events to all connected WebSocket clients
- Configurable via environment variables

## Diagram

```

┌──────────────┐        ┌──────────────────┐        ┌────────────────────┐
│ Origin       │───────▶│ Aggregator       │───────▶│ Connected Clients  │
└──────────────┘        └──────────────────┘        └────────────────────┘

▲
│ Aggregates JSON messages over WebSocket by `serialno` in a specified time interval
▼
````

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- Docker (optional, for running the full system)

### Installation

```bash
npm install
````

### Configuration

Create a `.env` file with the following variables, or just pass it:

```env
WEBSOCKET_PORT=8080
ORIGIN_SERVICE_URL=ws://localhost:9000
AGGREGATION_INTERVAL_MS=5000
DEBUG_LOGGING=true
```

These variables can also be set via command line or as environment variables.

### Running the Aggregator

```bash
npm start
```

This starts the WebSocket server on the configured `WEBSOCKET_PORT` and connects to the origin service.

### Running with Docker Compose

You can spin up the aggregator and a mock origin WebSocket service:

```bash
docker-compose up --build
```

This will:

- Run a mock origin WebSocket server on `ws://localhost:9000` that broadcasts a random event every second
- Start the aggregator on `ws://localhost:8080`

### Scripts

- `npm start` – Run the application
- `npm run lint` – Lint code with ESLint
- `npm run format` – Format code with Prettier
- `npm test` – Run tests with Jest

## Client testing with websocat and jq

You can test the aggregator locally by connecting to it using [`websocat`](https://github.com/vi/websocat) and optionally formatting the messages with [`jq`](https://stedolan.github.io/jq/).

1. **Install websocat and jq:**

- On macOS:

  ```bash
  brew install websocat jq
  ```

- On Linux:

  ```bash
  sudo apt-get install websocat jq
  ```

2. **Connect to the aggregator WebSocket server:**

  ```bash
  websocat ws://localhost:8080 | jq .
  ```

3. **The incoming aggregated JSON messages will be nicely formatted by jq**
