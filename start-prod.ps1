# Kill process on port 3000
Write-Host "Stopping any process on port 3000..."
npx --yes kill-port 3000
Start-Sleep -Seconds 2

# Install dependencies
Write-Host "Installing dependencies..."
& pnpm install

# Clean previous build cache
Write-Host "Cleaning previous build cache..."
if (Test-Path ".next") {
    Remove-Item -Path ".next" -Recurse -Force
}

# Build the project
Write-Host "Building the project..."
& pnpm build

if ($LASTEXITCODE -eq 0) {
    Write-Host "Build successful!"
    Write-Host "Starting production server..."

    # Start the server in a new hidden process
    # We redirect both stdout and stderr to .prod.log
    Start-Process -FilePath "pwsh" -ArgumentList "-Command", "& { pnpm start 2>&1 | Out-File -FilePath .prod.log -Encoding utf8 }" -WindowStyle Hidden

    Write-Host "Production server is running in the background."
    Write-Host "Logs are being written to .prod.log"
    Write-Host "You can close this terminal now."
} else {
    Write-Host "Build failed!"
    exit 1
}
