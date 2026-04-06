#!/bin/sh
# DanClaw Agent Runtime - Startup Script

set -e

echo "Starting DanClaw Agent Runtime..."

# Wait for dependencies
if [ -n "$WAIT_FOR_SERVICES" ]; then
  for service in $WAIT_FOR_SERVICES; do
    echo "Waiting for $service..."
    until curl -sf "$service/health" > /dev/null 2>&1; do
      echo "$service is unavailable - sleeping"
      sleep 2
    done
    echo "$service is up"
  done
fi

# Run database migrations if needed
if [ -n "$INSFORGE_URL" ] && [ -n "$INSFORGE_ANON_KEY" ]; then
  echo "Checking database connection..."
  # Migration check can be added here
fi

# Start the agent server
exec dumb-init -- node dist/server.js
