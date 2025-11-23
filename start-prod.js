const { spawn } = require('child_process');
const os = require('os');

const isWindows = os.platform() === 'win32';

console.log(`Detected platform: ${os.platform()}`);

if (isWindows) {
  console.log('Running Windows start script...');
  const child = spawn('pwsh', ['-ExecutionPolicy', 'Bypass', '-File', 'start-prod.ps1'], { stdio: 'inherit' });
  child.on('exit', (code) => process.exit(code));
} else {
  console.log('Running Linux/Mac start script...');
  const child = spawn('bash', ['start-prod.sh'], { stdio: 'inherit' });
  child.on('exit', (code) => process.exit(code));
}
