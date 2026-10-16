import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const port = Number(process.env.PORT) || 3000;
const url = `http://localhost:${port}`;
const server = spawn(process.execPath, ['--watch', 'app.js'], { stdio: 'inherit' });

server.on('error', (error) => {
  console.error(`Could not start the portfolio: ${error.message}`);
  process.exitCode = 1;
});

server.on('exit', (code, signal) => {
  if (signal) {
    process.exitCode = 1;
  } else if (code !== 0) {
    process.exitCode = code ?? 1;
  }
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.kill(signal));
}

function launchChrome() {
  if (process.platform === 'win32') {
    const candidates = [
      process.env.PROGRAMFILES && `${process.env.PROGRAMFILES}\\Google\\Chrome\\Application\\chrome.exe`,
      process.env['PROGRAMFILES(X86)'] && `${process.env['PROGRAMFILES(X86)']}\\Google\\Chrome\\Application\\chrome.exe`,
      process.env.LOCALAPPDATA && `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
    ].filter(Boolean);
    const chromePath = candidates.find((candidate) => existsSync(candidate));

    if (chromePath) {
      const chrome = spawn(chromePath, [url], { detached: true, stdio: 'ignore' });
      chrome.on('error', (error) => console.error(`Could not open Chrome: ${error.message}`));
      chrome.unref();
      return;
    }
  }

  const command = process.platform === 'win32'
    ? spawn('cmd.exe', ['/d', '/s', '/c', `start "" "${url}"`], { detached: true, stdio: 'ignore' })
    : spawn(process.platform === 'darwin' ? 'open' : 'xdg-open', [url], { detached: true, stdio: 'ignore' });
  command.on('error', (error) => console.error(`Could not open the browser: ${error.message}`));
  command.unref();
}

async function openWhenReady() {
  const deadline = Date.now() + 30_000;

  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error('The portfolio server stopped before it was ready.');
    }

    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(1_000) });
      if (response.ok) {
        console.info(`Opening Chrome at ${url}`);
        launchChrome();
        return;
      }
    } catch {
      // The server may need a moment to start listening.
    }

    await delay(500);
  }

  throw new Error(`The portfolio server did not respond at ${url} within 30 seconds.`);
}

openWhenReady().catch((error) => {
  console.error(error.message);
  server.kill();
  process.exitCode = 1;
});
