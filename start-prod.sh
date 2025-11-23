#!/bin/bash

# Kill process on port 3000
echo "Stopping any process on port 3000..."
npx --yes kill-port 3000

# Build the project
echo "Building the project..."
if pnpm build; then
  echo "Build successful!"
  echo "Starting production server..."
  nohup pnpm start > .prod.log 2>&1 &
  echo "Production server is running in the background."
  echo "Logs are being written to .prod.log"
else
  echo "Build failed!"
  exit 1
fi
