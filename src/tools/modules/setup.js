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

const MARINER5_HOME = process.env.MARINER5_HOME || process.env.IR5_HOME || 'C:\\DATA\\Project\\mariner5';

// RDBMS 템플릿 (7가지)
const RDBMS_TEMPLATES = {
  derby: {
    name: 'Derby (임베디드)',
    driverClass: 'org.apache.derby.jdbc.ClientDriver',
    urlTemplate: 'jdbc:derby://127.0.0.1:1527/mariner5',
    username: 'dba',
    password: '1111',
    port: 1527
  },
  h2: {
    name: 'H2 Database',
    driverClass: 'org.h2.Driver',
    urlTemplate: 'jdbc:h2:tcp://localhost:9092/./mariner5',
    username: 'scott',
    password: 'tiger',
    port: 9092
  },
  mysql: {
    name: 'MySQL',
    driverClass: 'org.gjt.mm.mysql.Driver',
    urlTemplate: 'jdbc:mysql://127.0.0.1:3306/mariner5?useUnicode=true&characterEncoding=utf8',
    username: 'root',
    password: '',
    port: 3306
  },
  mariadb: {
    name: 'MariaDB',
    driverClass: 'org.mariadb.jdbc.Driver',
    urlTemplate: 'jdbc:mariadb://127.0.0.1:3306/mariner5?autoReconnect=true',
    username: 'root',
    password: '',
    port: 3306
  },
  oracle: {
    name: 'Oracle',
    driverClass: 'oracle.jdbc.driver.OracleDriver',
    urlTemplate: 'jdbc:oracle:thin:@127.0.0.1:1521:MARINER5',
    username: 'scott',
    password: 'tiger',
    port: 1521
  },
  postgresql: {
    name: 'PostgreSQL',
    driverClass: 'org.postgresql.Driver',
    urlTemplate: 'jdbc:postgresql://127.0.0.1/mariner5',
    username: 'postgres',
    password: '',
    port: 5432
  },
  sqlserver: {
    name: 'SQL Server',
    driverClass: 'net.sourceforge.jtds.jdbc.Driver',
    urlTemplate: 'jdbc:jtds:sqlserver://127.0.0.1:1433;DatabaseName=mariner5;SelectMethod=Cursor',
    username: 'sa',
    password: '',
    port: 1433
  }
};

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

// ======================== MPC 기능 ========================

// Java 자동 감지 (Windows Registry)
async function detectJavaHome() {
  // 1. 환경변수 확인
  if (process.env.JAVA_HOME && fs.existsSync(process.env.JAVA_HOME)) {
    try {
      const { stdout } = await execAsync(`"${path.join(process.env.JAVA_HOME, 'bin', 'java.exe')}" -version`);
      return { found: true, path: process.env.JAVA_HOME, version: stdout.trim() };
    } catch (err) {
      // 무시하고 다음 방법 시도
    }
  }

  // 2. which java (Linux/Mac)
  try {
    const { stdout } = await execAsync('which java');
    const javaPath = stdout.trim();
    if (javaPath) {
      // java 경로에서 JAVA_HOME 추출 (예: /usr/bin/java -> /usr)
      const javaHome = path.dirname(path.dirname(javaPath));
      const { stdout: version } = await execAsync(`"${javaPath}" -version`);
      return { found: true, path: javaHome, version: version.trim() };
    }
  } catch (err) {
    // 무시하고 다음 방법 시도
  }

  // 3. Windows Registry 탐색
  if (process.platform === 'win32') {
    try {
      const { stdout } = await execAsync('reg query "HKLM\\SOFTWARE\\JavaSoft\\Java Development Kit" /s');
      const lines = stdout.split('\n');
      for (const line of lines) {
        if (line.includes('JavaHome')) {
          const match = line.match(/JavaHome\s+REG_SZ\s+(.+)/);
          if (match && fs.existsSync(match[1].trim())) {
            const javaHome = match[1].trim();
            const { stdout: version } = await execAsync(`"${path.join(javaHome, 'bin', 'java.exe')}" -version`);
            return { found: true, path: javaHome, version: version.trim() };
          }
        }
      }
    } catch (err) {
      // 무시
    }
  }

  return { found: false, path: null, version: null };
}

// startup.properties 생성
function generateStartupProperties(mariner5Home, options = {}) {
  const debug = options.debug || false;
  const timestamp = new Date().toISOString();

  return `# Mariner5 Startup Configuration
# 자동 생성됨: ${timestamp} (mariner5-mcp)

# Mariner5 설치 경로
ir.home=${mariner5Home.replace(/\\/g, '\\\\')}

# 디버그 옵션
ir.debug=${debug}
ir.debug.sqlQuery=${debug}
ir.debug.workerThread=${debug}
ir.debug.searchResult=${debug}
ir.debug.queryParsing=${debug}
ir.debug.analyzer=${debug}
ir.debug.indexing=${debug}
ir.debug.collection=${debug}

# 로그 레벨 (DEBUG, INFO, WARN, ERROR)
ir.log.level=${debug ? 'DEBUG' : 'INFO'}

# 서버 포트
ir.admin.port=5555
ir.web.port=8080

# 메모리 설정 (MB)
ir.memory.initial=512
ir.memory.maximum=2048
`;
}

// ir.rdbms.properties 생성
function generateRdbmsProperties(rdbmsType, customConfig = {}) {
  const template = RDBMS_TEMPLATES[rdbmsType];
  if (!template) {
    throw new Error(`Unsupported RDBMS type: ${rdbmsType}`);
  }

  const timestamp = new Date().toISOString();
  const config = { ...template, ...customConfig };

  return `# Mariner5 RDBMS Configuration
# 자동 생성됨: ${timestamp} (mariner5-mcp)

# 테이블 접두사
ir.table.prefix IR5

# JDBC 설정
ir.jdbc.driver.class ${config.driverClass}
ir.jdbc.username ${config.username}
ir.jdbc.password ${config.password}
ir.jdbc.url ${config.urlTemplate}

# 커넥션 풀 설정
ir.db.connection.pool true
ir.db.connection.pool.timeout 3600000
ir.db.connection.pool.minSize 5
ir.db.connection.pool.maxSize 20

# 암호화 설정
ir.useEncryption false

# 자동 재연결
ir.db.autoReconnect true
`;
}

export const setup = {
  // ======================== MPC 도구 ========================

  'setup.mpc.detectJava': {
    handler: async (input) => {
      const javaInfo = await detectJavaHome();
      return ok('setup.mpc.detectJava', input, javaInfo);
    }
  },

  'setup.mpc.listRdbms': {
    handler: async (input) => {
      const rdbmsList = Object.entries(RDBMS_TEMPLATES).map(([key, value]) => ({
        key,
        name: value.name,
        port: value.port,
        defaultUrl: value.urlTemplate
      }));
      return ok('setup.mpc.listRdbms', input, { rdbms: rdbmsList });
    }
  },

  'setup.mpc.configure': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        required: ['mariner5Home', 'rdbmsType'],
        properties: {
          mariner5Home: { type: 'string' },
          javaHome: { type: 'string' },
          rdbmsType: { type: 'string', enum: ['derby', 'h2', 'mysql', 'mariadb', 'oracle', 'postgresql', 'sqlserver'] },
          rdbmsConfig: {
            type: 'object',
            properties: {
              username: { type: 'string' },
              password: { type: 'string' },
              urlTemplate: { type: 'string' },
              port: { type: 'integer' }
            }
          },
          debug: { type: 'boolean', default: false }
        }
      };
      makeValidator(schema)(input);

      const { mariner5Home, javaHome, rdbmsType, rdbmsConfig = {}, debug = false } = input;

      // 1. Mariner5 경로 검증
      if (!fs.existsSync(mariner5Home)) {
        return fail('E_MARINER5_NOT_FOUND', `Mariner5 경로를 찾을 수 없습니다: ${mariner5Home}`);
      }

      const serverManagerPath = path.join(mariner5Home, 'serverManager');
      const rdbmsPath = path.join(mariner5Home, 'rdbms');

      if (!fs.existsSync(serverManagerPath)) {
        return fail('E_SERVERMANAGER_NOT_FOUND', `serverManager 디렉토리를 찾을 수 없습니다: ${serverManagerPath}`);
      }

      if (!fs.existsSync(rdbmsPath)) {
        fs.mkdirSync(rdbmsPath, { recursive: true });
      }

      // 2. Java 경로 검증
      let finalJavaHome = javaHome;
      if (!finalJavaHome) {
        const javaInfo = await detectJavaHome();
        if (!javaInfo.found) {
          return fail('E_JAVA_NOT_FOUND', 'Java를 찾을 수 없습니다. JAVA_HOME 환경변수를 설정하거나 javaHome 파라미터를 지정하세요');
        }
        finalJavaHome = javaInfo.path;
      }

      // 3. startup.properties 생성
      const startupPropertiesPath = path.join(serverManagerPath, 'startup.properties');
      const startupProperties = generateStartupProperties(mariner5Home, { debug });
      fs.writeFileSync(startupPropertiesPath, startupProperties, 'utf-8');

      // 4. ir.rdbms.properties 생성
      const rdbmsPropertiesPath = path.join(rdbmsPath, 'ir.rdbms.properties');
      const rdbmsProperties = generateRdbmsProperties(rdbmsType, rdbmsConfig);
      fs.writeFileSync(rdbmsPropertiesPath, rdbmsProperties, 'utf-8');

      // 5. 환경변수 설정 (선택사항 - 사용자가 직접 설정해야 함)
      const envVars = {
        JAVA_HOME: finalJavaHome,
        IR5_HOME: mariner5Home,
        MARINER5_HOME: mariner5Home
      };

      return ok('setup.mpc.configure', input, {
        success: true,
        files: {
          startupProperties: startupPropertiesPath,
          rdbmsProperties: rdbmsPropertiesPath
        },
        config: {
          mariner5Home,
          javaHome: finalJavaHome,
          rdbmsType,
          debug
        },
        environmentVariables: envVars,
        message: 'Mariner5 설정 완료. 환경변수는 수동으로 설정하세요 (JAVA_HOME, IR5_HOME)'
      });
    }
  },

  'setup.mpc.verify': {
    handler: async (input) => {
      const schema = {
        type: 'object',
        properties: {
          mariner5Home: { type: 'string' }
        }
      };
      makeValidator(schema)(input);

      const mariner5Home = input.mariner5Home || MARINER5_HOME;

      const checks = [];

      // 1. Mariner5 경로
      const mariner5Exists = fs.existsSync(mariner5Home);
      checks.push({
        name: 'Mariner5 설치 경로',
        path: mariner5Home,
        status: mariner5Exists ? 'OK' : 'FAIL'
      });

      // 2. serverManager
      const serverManagerPath = path.join(mariner5Home, 'serverManager');
      const serverManagerExists = fs.existsSync(serverManagerPath);
      checks.push({
        name: 'serverManager 디렉토리',
        path: serverManagerPath,
        status: serverManagerExists ? 'OK' : 'FAIL'
      });

      // 3. startup.properties
      const startupPropertiesPath = path.join(serverManagerPath, 'startup.properties');
      const startupPropertiesExists = fs.existsSync(startupPropertiesPath);
      checks.push({
        name: 'startup.properties',
        path: startupPropertiesPath,
        status: startupPropertiesExists ? 'OK' : 'FAIL'
      });

      // 4. rdbms
      const rdbmsPath = path.join(mariner5Home, 'rdbms');
      const rdbmsExists = fs.existsSync(rdbmsPath);
      checks.push({
        name: 'rdbms 디렉토리',
        path: rdbmsPath,
        status: rdbmsExists ? 'OK' : 'FAIL'
      });

      // 5. ir.rdbms.properties
      const rdbmsPropertiesPath = path.join(rdbmsPath, 'ir.rdbms.properties');
      const rdbmsPropertiesExists = fs.existsSync(rdbmsPropertiesPath);
      checks.push({
        name: 'ir.rdbms.properties',
        path: rdbmsPropertiesPath,
        status: rdbmsPropertiesExists ? 'OK' : 'FAIL'
      });

      // 6. Java
      const javaInfo = await detectJavaHome();
      checks.push({
        name: 'Java 설치',
        path: javaInfo.path || 'N/A',
        status: javaInfo.found ? 'OK' : 'FAIL',
        version: javaInfo.version || 'N/A'
      });

      const allValid = checks.every(c => c.status === 'OK');

      return ok('setup.mpc.verify', input, {
        valid: allValid,
        checks,
        message: allValid ? '모든 검증 통과' : '일부 검증 실패'
      });
    }
  },

  // ======================== 기존 도구 ========================

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
