import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { tools } from './tools/index.js';
import { initializeJavaClasses, connectToAdminServer } from './java-wrapper.js';
import { connectionManager } from './connection-manager.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serversConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/servers.json'), 'utf-8'));

dotenv.config();

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
function log(level, ...args) {
  const order = { debug:0, info:1, warn:2, error:3 };
  if (order[level] >= order[LOG_LEVEL]) {
    console.error(`[${level}]`, ...args);
  }
}

// Java 환경 초기화
let javaReady = false;
async function initializeJava() {
  try {
    log('info', 'Initializing Java environment...');
    await initializeJavaClasses();

    const host = process.env.MARINER5_HOST || 'localhost';
    const port = parseInt(process.env.MARINER5_PORT || '5555');
    await connectToAdminServer(host, port);

    javaReady = true;
    log('info', `Java environment initialized (${host}:${port})`);
  } catch (error) {
    log('warn', `Failed to initialize Java environment: ${error.message}`);
    log('info', 'Falling back to REST API mode (if configured)');
    javaReady = false;
  }
}

// 멀티 인스턴스 초기화
async function initializeConnections() {
  try {
    log('info', 'Initializing multi-instance connection manager...');

    for (const [name, config] of Object.entries(serversConfig.servers)) {
      try {
        await connectionManager.addServer(name, config.host, config.port, config.description);
      } catch (error) {
        log('warn', `Failed to connect to server '${name}': ${error.message}`);
      }
    }

    // 기본 서버 설정
    const defaultServer = serversConfig.default || 'local';
    if (connectionManager.listServers().includes(defaultServer)) {
      connectionManager.setDefaultServer(defaultServer);
      log('info', `Default server set to: ${defaultServer}`);
    }

    const stats = connectionManager.getStatistics();
    log('info', `Connection manager initialized: ${stats.connectedServers}/${stats.totalServers} servers connected`);
  } catch (error) {
    log('warn', `Error initializing connection manager: ${error.message}`);
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

// Initialize Java environment on startup
await initializeJava();

// Initialize multi-instance connection manager
await initializeConnections();

// Health ping for manual testing
if (process.argv.includes('--ping')) {
  console.log(JSON.stringify({ id: 1, method: 'server.health', params: {} }));
}
