#!/usr/bin/env node
/**
 * Dev-only bridge: Supabase Site URL is often http://localhost:3000.
 * This server catches the reset callback and opens gifty:// in the iOS simulator.
 *
 * Run in a second terminal while testing password reset:
 *   yarn dev:reset-redirect
 */

import { createServer } from 'node:http';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = 3000;
const dir = dirname(fileURLToPath(import.meta.url));
const pageHtml = readFileSync(join(dir, 'dev-reset-redirect', 'index.html'), 'utf8');

function openInSimulator(hash) {
  if (!hash || !hash.includes('access_token')) {
    return { ok: false, error: 'No access_token in hash' };
  }

  const deepLink = `gifty://reset-password${hash.startsWith('#') ? hash : `#${hash}`}`;
  const result = spawnSync('xcrun', ['simctl', 'openurl', 'booted', deepLink], {
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    return {
      ok: false,
      error: result.stderr?.trim() || 'simctl failed — is the iOS simulator running?',
      deepLink,
    };
  }

  return { ok: true, deepLink };
}

const server = createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/open-in-simulator') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        const { hash } = JSON.parse(body);
        const result = openInSimulator(hash ?? '');
        res.writeHead(result.ok ? 200 : 500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
        if (result.ok) {
          console.log('Opened reset link in simulator');
        } else {
          console.warn('Could not open simulator:', result.error);
        }
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'Invalid JSON body' }));
      }
    });
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(pageHtml);
});

server.listen(PORT, () => {
  console.log(`Gifty reset bridge listening on http://localhost:${PORT}`);
  console.log('Request a reset email, click the link, then this server opens the app in the simulator.');
});
