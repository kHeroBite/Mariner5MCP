import dotenv from 'dotenv';
import { ok, fail, makeValidator } from '../../utils.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import axios from 'axios';
import AdmZip from 'adm-zip';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(__dirname, '../../../config/services.json');
const execAsync = promisify(exec);

// 서비스 설정 로드
function loadServiceConfig() {
  try {
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }
  } catch (err) {
    // 설정 파일 없으면 기본값 반환
  }
  return {
    derby: { installed: false, path: '', port: 1527, dataPath: '' },
    search: { installed: false, path: '', port: 5555, configPath: '' },
    rest: { installed: false, path: '', port: 8080, configPath: '' },
    tomcat: { installed: false, path: '', port: 9090, webappsPath: '' }
  };
}

// 서비스 설정 저장
function saveServiceConfig(config) {
  const dir = path.dirname(configPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
}

// ZIP 압축 해제
async function extractZip(zipPath, targetPath) {
  try {
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(targetPath, true);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// URL에서 파일 다운로드
async function downloadFile(url, destPath) {
  try {
    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'stream'
    });
    const writer = fs.createWriteStream(destPath);
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve({ success: true }));
      writer.on('error', (err) => reject({ success: false, error: err.message }));
    });
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// 프로세스 찾기 (포트 기반)
async function findProcessByPort(port) {
  try {
    const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
    const lines = stdout.trim().split('\n');
    const pids = lines.map(line => {
      const parts = line.trim().split(/\s+/);
      return parts[parts.length - 1];
    }).filter(pid => pid && pid !== '0');
    return pids.length > 0 ? pids[0] : null;
  } catch (err) {
    return null;
  }
}

// 프로세스 상태 확인
async function checkServiceStatus(serviceName, port) {
  const pid = await findProcessByPort(port);
  if (pid) {
    return { running: true, pid };
  }
  return { running: false, pid: null };
}

// Derby DB 시작
async function startDerby(config) {
  const derbyPath = config.derby.path;
  const port = config.derby.port;
  const dataPath = config.derby.dataPath || path.join(derbyPath, 'data');

  if (!fs.existsSync(derbyPath)) {
    return fail('E_DERBY_NOT_FOUND', `Derby 경로를 찾을 수 없습니다: ${derbyPath}`);
  }

  const status = await checkServiceStatus('derby', port);
  if (status.running) {
    return ok('setup.start', { service: 'derby' }, { message: 'Derby는 이미 실행 중입니다', pid: status.pid });
  }

  const startScript = path.join(derbyPath, 'bin', 'startNetworkServer.bat');
  if (!fs.existsSync(startScript)) {
    return fail('E_DERBY_SCRIPT_NOT_FOUND', `Derby 시작 스크립트를 찾을 수 없습니다: ${startScript}`);
  }

  try {
    const proc = spawn(startScript, [], {
      cwd: derbyPath,
      detached: true,
      stdio: 'ignore',
      env: { ...process.env, DERBY_HOME: derbyPath }
    });
    proc.unref();

    // 3초 대기 후 상태 확인
    await new Promise(resolve => setTimeout(resolve, 3000));
    const newStatus = await checkServiceStatus('derby', port);

    if (newStatus.running) {
      return ok('setup.start', { service: 'derby' }, { message: 'Derby 시작 완료', pid: newStatus.pid, port });
    } else {
      return fail('E_DERBY_START_FAILED', 'Derby 시작 실패');
    }
  } catch (err) {
    return fail('E_DERBY_START_ERROR', err.message);
  }
}

// 검색엔진 시작
async function startSearchEngine(config) {
  const searchPath = config.search.path;
  const port = config.search.port;

  if (!fs.existsSync(searchPath)) {
    return fail('E_SEARCH_NOT_FOUND', `검색엔진 경로를 찾을 수 없습니다: ${searchPath}`);
  }

  const status = await checkServiceStatus('search', port);
  if (status.running) {
    return ok('setup.start', { service: 'search' }, { message: '검색엔진은 이미 실행 중입니다', pid: status.pid });
  }

  const startScript = path.join(searchPath, 'bin', 'start.bat');
  if (!fs.existsSync(startScript)) {
    return fail('E_SEARCH_SCRIPT_NOT_FOUND', `검색엔진 시작 스크립트를 찾을 수 없습니다: ${startScript}`);
  }

  try {
    const proc = spawn(startScript, [], {
      cwd: searchPath,
      detached: true,
      stdio: 'ignore'
    });
    proc.unref();

    await new Promise(resolve => setTimeout(resolve, 5000));
    const newStatus = await checkServiceStatus('search', port);

    if (newStatus.running) {
      return ok('setup.start', { service: 'search' }, { message: '검색엔진 시작 완료', pid: newStatus.pid, port });
    } else {
      return fail('E_SEARCH_START_FAILED', '검색엔진 시작 실패');
    }
  } catch (err) {
    return fail('E_SEARCH_START_ERROR', err.message);
  }
}

// REST 서버 시작
async function startRestServer(config) {
  const restPath = config.rest.path;
  const port = config.rest.port;

  if (!fs.existsSync(restPath)) {
    return fail('E_REST_NOT_FOUND', `REST 서버 경로를 찾을 수 없습니다: ${restPath}`);
  }

  const status = await checkServiceStatus('rest', port);
  if (status.running) {
    return ok('setup.start', { service: 'rest' }, { message: 'REST 서버는 이미 실행 중입니다', pid: status.pid });
  }

  const startScript = path.join(restPath, 'bin', 'start.bat');
  if (!fs.existsSync(startScript)) {
    return fail('E_REST_SCRIPT_NOT_FOUND', `REST 서버 시작 스크립트를 찾을 수 없습니다: ${startScript}`);
  }

  try {
    const proc = spawn(startScript, [], {
      cwd: restPath,
      detached: true,
      stdio: 'ignore'
    });
    proc.unref();

    await new Promise(resolve => setTimeout(resolve, 5000));
    const newStatus = await checkServiceStatus('rest', port);

    if (newStatus.running) {
      return ok('setup.start', { service: 'rest' }, { message: 'REST 서버 시작 완료', pid: newStatus.pid, port });
    } else {
      return fail('E_REST_START_FAILED', 'REST 서버 시작 실패');
    }
  } catch (err) {
    return fail('E_REST_START_ERROR', err.message);
  }
}

// Tomcat 시작
async function startTomcat(config) {
  const tomcatPath = config.tomcat.path;
  const port = config.tomcat.port;

  if (!fs.existsSync(tomcatPath)) {
    return fail('E_TOMCAT_NOT_FOUND', `Tomcat 경로를 찾을 수 없습니다: ${tomcatPath}`);
  }

  const status = await checkServiceStatus('tomcat', port);
  if (status.running) {
    return ok('setup.start', { service: 'tomcat' }, { message: 'Tomcat은 이미 실행 중입니다', pid: status.pid });
  }

  const startScript = path.join(tomcatPath, 'bin', 'startup.bat');
  if (!fs.existsSync(startScript)) {
    return fail('E_TOMCAT_SCRIPT_NOT_FOUND', `Tomcat 시작 스크립트를 찾을 수 없습니다: ${startScript}`);
  }

  try {
    const proc = spawn(startScript, [], {
      cwd: path.join(tomcatPath, 'bin'),
      detached: true,
      stdio: 'ignore',
      env: { ...process.env, CATALINA_HOME: tomcatPath }
    });
    proc.unref();

    await new Promise(resolve => setTimeout(resolve, 8000));
    const newStatus = await checkServiceStatus('tomcat', port);

    if (newStatus.running) {
      return ok('setup.start', { service: 'tomcat' }, { message: 'Tomcat 시작 완료', pid: newStatus.pid, port });
    } else {
      return fail('E_TOMCAT_START_FAILED', 'Tomcat 시작 실패');
    }
  } catch (err) {
    return fail('E_TOMCAT_START_ERROR', err.message);
  }
}

// 프로세스 종료
async function killProcess(pid) {
  try {
    await execAsync(`taskkill /F /PID ${pid}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export const setup = {
  'setup.detect': {
    handler: async (input) => {
      const config = loadServiceConfig();
      const result = {};

      for (const [service, info] of Object.entries(config)) {
        const status = await checkServiceStatus(service, info.port);
        result[service] = {
          installed: info.installed,
          path: info.path,
          port: info.port,
          running: status.running,
          pid: status.pid
        };
      }

      return ok('setup.detect', input, result);
    }
  },

  'setup.install': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['service', 'source', 'sourceType'],
        properties: {
          service: { type: 'string', enum: ['derby', 'search', 'rest', 'tomcat'] },
          source: { type: 'string' },
          sourceType: { type: 'string', enum: ['installed', 'local', 'url'] },
          targetPath: { type: 'string' },
          port: { type: 'integer' }
        }
      };
      makeValidator(schema)(input);

      const { service, source, sourceType, targetPath, port } = input;
      const config = loadServiceConfig();

      // sourceType에 따라 처리
      if (sourceType === 'installed') {
        // 이미 설치된 경로 등록
        if (!fs.existsSync(source)) {
          return fail('E_PATH_NOT_FOUND', `경로를 찾을 수 없습니다: ${source}`);
        }
        config[service].installed = true;
        config[service].path = source;
        if (port) config[service].port = port;
        saveServiceConfig(config);
        return ok('setup.install', input, { message: `${service} 경로 등록 완료`, path: source });
      } else if (sourceType === 'local') {
        // 로컬 ZIP 파일 압축 해제
        if (!fs.existsSync(source)) {
          return fail('E_FILE_NOT_FOUND', `파일을 찾을 수 없습니다: ${source}`);
        }
        const target = targetPath || path.join(process.cwd(), service);
        const result = await extractZip(source, target);
        if (!result.success) {
          return fail('E_EXTRACT_FAILED', result.error);
        }
        config[service].installed = true;
        config[service].path = target;
        if (port) config[service].port = port;
        saveServiceConfig(config);
        return ok('setup.install', input, { message: `${service} 설치 완료`, path: target });
      } else if (sourceType === 'url') {
        // URL에서 다운로드 후 압축 해제
        const tempZip = path.join(process.cwd(), `${service}-temp.zip`);
        const downloadResult = await downloadFile(source, tempZip);
        if (!downloadResult.success) {
          return fail('E_DOWNLOAD_FAILED', downloadResult.error);
        }
        const target = targetPath || path.join(process.cwd(), service);
        const extractResult = await extractZip(tempZip, target);
        fs.unlinkSync(tempZip); // 임시 파일 삭제
        if (!extractResult.success) {
          return fail('E_EXTRACT_FAILED', extractResult.error);
        }
        config[service].installed = true;
        config[service].path = target;
        if (port) config[service].port = port;
        saveServiceConfig(config);
        return ok('setup.install', input, { message: `${service} 다운로드 및 설치 완료`, path: target });
      }
    }
  },

  'setup.configure': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['service'],
        properties: {
          service: { type: 'string', enum: ['derby', 'search', 'rest', 'tomcat'] },
          port: { type: 'integer' },
          configOptions: { type: 'object' }
        }
      };
      makeValidator(schema)(input);

      const { service, port, configOptions } = input;
      const config = loadServiceConfig();

      if (!config[service].installed) {
        return fail('E_NOT_INSTALLED', `${service}가 설치되지 않았습니다`);
      }

      if (port) {
        config[service].port = port;
      }

      if (configOptions) {
        Object.assign(config[service], configOptions);
      }

      saveServiceConfig(config);
      return ok('setup.configure', input, { message: `${service} 설정 완료`, config: config[service] });
    }
  },

  'setup.start': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['service'],
        properties: {
          service: { type: 'string', enum: ['derby', 'search', 'rest', 'tomcat', 'all'] }
        }
      };
      makeValidator(schema)(input);

      const { service } = input;
      const config = loadServiceConfig();

      if (service === 'all') {
        const results = {};
        for (const svc of ['derby', 'search', 'rest', 'tomcat']) {
          if (!config[svc].installed) {
            results[svc] = { success: false, message: '설치되지 않음' };
            continue;
          }
          let result;
          if (svc === 'derby') result = await startDerby(config);
          else if (svc === 'search') result = await startSearchEngine(config);
          else if (svc === 'rest') result = await startRestServer(config);
          else if (svc === 'tomcat') result = await startTomcat(config);
          results[svc] = result;
        }
        return ok('setup.start', input, results);
      }

      if (!config[service].installed) {
        return fail('E_NOT_INSTALLED', `${service}가 설치되지 않았습니다`);
      }

      if (service === 'derby') return await startDerby(config);
      if (service === 'search') return await startSearchEngine(config);
      if (service === 'rest') return await startRestServer(config);
      if (service === 'tomcat') return await startTomcat(config);
    }
  },

  'setup.stop': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['service'],
        properties: {
          service: { type: 'string', enum: ['derby', 'search', 'rest', 'tomcat', 'all'] }
        }
      };
      makeValidator(schema)(input);

      const { service } = input;
      const config = loadServiceConfig();

      if (service === 'all') {
        const results = {};
        for (const svc of ['derby', 'search', 'rest', 'tomcat']) {
          const status = await checkServiceStatus(svc, config[svc].port);
          if (status.running && status.pid) {
            const killResult = await killProcess(status.pid);
            results[svc] = killResult.success ? { message: '중지 완료' } : { message: '중지 실패', error: killResult.error };
          } else {
            results[svc] = { message: '실행 중이 아님' };
          }
        }
        return ok('setup.stop', input, results);
      }

      const status = await checkServiceStatus(service, config[service].port);
      if (!status.running) {
        return ok('setup.stop', input, { message: `${service}는 실행 중이 아닙니다` });
      }

      const killResult = await killProcess(status.pid);
      if (killResult.success) {
        return ok('setup.stop', input, { message: `${service} 중지 완료` });
      } else {
        return fail('E_STOP_FAILED', killResult.error);
      }
    }
  },

  'setup.status': {
    handler: async (input) => {
      const config = loadServiceConfig();
      const result = {};

      for (const [service, info] of Object.entries(config)) {
        const status = await checkServiceStatus(service, info.port);
        result[service] = {
          installed: info.installed,
          path: info.path,
          port: info.port,
          running: status.running,
          pid: status.pid,
          status: status.running ? 'running' : 'stopped'
        };
      }

      return ok('setup.status', input, result);
    }
  },

  'setup.logs': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['service'],
        properties: {
          service: { type: 'string', enum: ['derby', 'search', 'rest', 'tomcat'] },
          lines: { type: 'integer', minimum: 1, maximum: 1000 }
        }
      };
      makeValidator(schema)(input);

      const { service, lines = 100 } = input;
      const config = loadServiceConfig();

      if (!config[service].installed) {
        return fail('E_NOT_INSTALLED', `${service}가 설치되지 않았습니다`);
      }

      const logPaths = {
        derby: path.join(config.derby.path, 'derby.log'),
        search: path.join(config.search.path, 'logs', 'search.log'),
        rest: path.join(config.rest.path, 'logs', 'rest.log'),
        tomcat: path.join(config.tomcat.path, 'logs', 'catalina.out')
      };

      const logPath = logPaths[service];
      if (!fs.existsSync(logPath)) {
        return fail('E_LOG_NOT_FOUND', `로그 파일을 찾을 수 없습니다: ${logPath}`);
      }

      try {
        const { stdout } = await execAsync(`tail -n ${lines} "${logPath}"`, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
        return ok('setup.logs', input, { logs: stdout.split('\n') });
      } catch (err) {
        // Windows에서 tail 명령어가 없을 경우 Node.js로 읽기
        try {
          const content = fs.readFileSync(logPath, 'utf-8');
          const allLines = content.split('\n');
          const lastLines = allLines.slice(-lines);
          return ok('setup.logs', input, { logs: lastLines });
        } catch (readErr) {
          return fail('E_LOG_READ_FAILED', readErr.message);
        }
      }
    }
  }
};
