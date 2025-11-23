#!/bin/bash

# Kill process on port 3000
echo "Stopping any process on port 3000..."
# Try aggressive kill first
if command -v fuser &> /dev/null; then
    fuser -k 3000/tcp
fi
npx --yes kill-port 3000
sleep 2

# Install dependencies
echo "Installing dependencies..."
pnpm install

# Clean previous build cache
echo "Cleaning previous build cache..."
rm -rf .next

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
