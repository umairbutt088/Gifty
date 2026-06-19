#!/usr/bin/env node
/**
 * Opens a Supabase password-reset callback in the iOS simulator as a gifty:// deep link.
 *
 * Usage:
 *   yarn open-reset-in-simulator "http://localhost:3000/#access_token=...&refresh_token=..."
 */

const input = process.argv[2];

if (!input) {
  console.error('Usage: yarn open-reset-in-simulator "<full reset callback URL>"');
  process.exit(1);
}

const hashIndex = input.indexOf('#');
if (hashIndex === -1) {
  console.error('URL has no # fragment (access_token). Paste the full URL from the browser bar.');
  process.exit(1);
}

const hash = input.slice(hashIndex);
const deepLink = `gifty://reset-password${hash}`;

console.log('Opening in simulator:\n', deepLink.slice(0, 80) + '…\n');

const { spawnSync } = await import('node:child_process');
const result = spawnSync('xcrun', ['simctl', 'openurl', 'booted', deepLink], {
  encoding: 'utf8',
});

if (result.status !== 0) {
  console.error(result.stderr || 'Failed. Is the iOS simulator running with Gifty installed?');
  process.exit(result.status ?? 1);
}

console.log('Done — Gifty should show the reset password screen.');
