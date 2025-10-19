#!/usr/bin/env node

/**
 * Mariner5 MCP (Model Context Protocol) Server
 * Command-line entry point for npm-installed package
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { fork } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageRoot = dirname(__dirname);
const serverScript = join(packageRoot, 'src', 'server.js');

// Fork the server process
const server = fork(serverScript, [], {
  stdio: 'inherit',
  cwd: packageRoot
});

// Handle process signals
process.on('SIGTERM', () => {
  server.kill('SIGTERM');
  process.exit(0);
});

process.on('SIGINT', () => {
  server.kill('SIGINT');
  process.exit(0);
});

// Handle server exit
server.on('exit', (code) => {
  process.exit(code);
});
