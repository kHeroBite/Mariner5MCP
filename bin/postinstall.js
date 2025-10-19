#!/usr/bin/env node

/**
 * Post-install script for mariner5-mcp package
 * Checks for required environment and dependencies
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.dirname(__dirname);
const envPath = path.join(packageRoot, '.env');
const envExamplePath = path.join(packageRoot, '.env.example');

// Check if .env exists, if not create from .env.example
if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    try {
      fs.copyFileSync(envExamplePath, envPath);
      console.log('✓ Created .env from .env.example');
    } catch (err) {
      console.warn('⚠ Could not create .env file:', err.message);
    }
  }
}

console.log('✓ Mariner5 MCP installation complete');
console.log('\nNext steps:');
console.log('  1. Edit .env to configure Mariner5 connection:');
console.log('     - MARINER5_HOME: Path to Mariner5 installation');
console.log('     - MARINER5_HOST: AdminServer host (default: localhost)');
console.log('     - MARINER5_PORT: AdminServer port (default: 5555)');
console.log('  2. Run: mariner5');
console.log('\nFor more info: mariner5 --help');
