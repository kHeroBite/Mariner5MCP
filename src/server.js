import fs from 'fs';
import dotenv from 'dotenv';
import { tools } from './tools/index.js';

dotenv.config();

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
function log(level, ...args) {
  const order = { debug:0, info:1, warn:2, error:3 };
  if (order[level] >= order[LOG_LEVEL]) {
    console.error(`[${level}]`, ...args);
  }
}

process.stdin.setEncoding('utf8');
let buf = '';

// Simple line-delimited JSON-RPC for MCP-like usage.
// Each line is a JSON object: { id, method, params }
process.stdin.on('data', chunk => {
  buf += chunk;
  let idx;
  while ((idx = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, idx).trim();
    buf = buf.slice(idx+1);
    if (!line) continue;
    handleLine(line);
  }
});

async function handleLine(line) {
  let msg;
  try {
    msg = JSON.parse(line);
  } catch (e) {
    write({ id: null, error: { code: -32700, message: 'Parse error' } });
    return;
  }
  const { id, method, params } = msg;
  const tool = tools[method];
  if (!tool) {
    write({ id, error: { code: -32601, message: `Unknown method: ${method}` } });
    return;
  }
  try {
    const result = await tool.handler(params||{});
    write({ id, result });
  } catch (e) {
    write({ id, error: { code: e.code||'E_TOOL', message: e.message, data: e.details||{} } });
  }
}

function write(obj) {
  process.stdout.write(JSON.stringify(obj) + '\n');
}

// Health ping for manual testing
if (process.argv.includes('--ping')) {
  console.log(JSON.stringify({ id: 1, method: 'server.health', params: {} }));
}
