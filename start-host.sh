#!/bin/bash
# Run Next.js dev server on 0.0.0.0 in the background
# Logs are redirected to .dev-host.log

echo "Starting Instant Bento on 0.0.0.0..."
npx --yes kill-port 3000
nohup pnpm next dev -H 0.0.0.0 > .dev-host.log 2>&1 &
echo "Server started! (PID: $!)"
echo "Logs are being written to .dev-host.log"
echo "You can close this terminal now."
