import dotenv from 'dotenv';
import { ok, fail, makeValidator } from '../../utils.js';
import fs from 'fs';
import path from 'path';

dotenv.config();

const MARINER5_HOME = process.env.MARINER5_HOME || 'C:\\DATA\\Project\\mariner5';

// Tomcat server.xml 설정 (webManager Context 추가)
async function configureTomcatServerXml(input) {
  const schema = {
    type: 'object',
    required: ['tomcatPath', 'webManagerPath'],
    properties: {
      tomcatPath: { type: 'string' },
      webManagerPath: { type: 'string' },
      contextPath: { type: 'string', default: '/mariner5' }
    }
  };
  makeValidator(schema)(input);

  const { tomcatPath, webManagerPath, contextPath = '/mariner5' } = input;
  const serverXmlPath = path.join(tomcatPath, 'conf', 'server.xml');

  if (!fs.existsSync(serverXmlPath)) {
    return fail('E_FILE_NOT_FOUND', `server.xml 파일을 찾을 수 없습니다: ${serverXmlPath}`);
  }

  try {
    let serverXml = fs.readFileSync(serverXmlPath, 'utf-8');

    // 기존 webManager Context 제거 (중복 방지)
    serverXml = serverXml.replace(
      /<Context[^>]*path="\/mariner5"[^>]*\/>/g,
      ''
    ).replace(
      /<Context[^>]*path="\/webManager"[^>]*\/>/g,
      ''
    );

    // Context 추가 위치 찾기 (</Host> 태그 직전)
    const hostEndTag = '</Host>';
    const hostEndIndex = serverXml.indexOf(hostEndTag);

    if (hostEndIndex === -1) {
      return fail('E_INVALID_XML', 'server.xml에서 </Host> 태그를 찾을 수 없습니다');
    }

    // 새 Context 추가
    const contextXml = `\n  <!-- mariner5 관리도구 Context -->\n  <Context path="${contextPath}" docBase="${webManagerPath.replace(/\\/g, '/')}" reloadable="true" />\n\n  `;
    serverXml = serverXml.slice(0, hostEndIndex) + contextXml + serverXml.slice(hostEndIndex);

    // 파일 저장
    fs.writeFileSync(serverXmlPath, serverXml, 'utf-8');

    return ok('tomcat.serverXml.configure', input, {
      success: true,
      serverXmlPath,
      contextPath,
      docBase: webManagerPath,
      message: 'server.xml 수정 완료. Tomcat 재시작 필요.'
    });
  } catch (err) {
    return fail('E_FILE_WRITE', `server.xml 수정 실패: ${err.message}`);
  }
}

// common.jsp 설정 (검색엔진 위치/IP/PORT)
async function configureCommonJsp(input) {
  const schema = {
    type: 'object',
    required: ['webManagerPath'],
    properties: {
      webManagerPath: { type: 'string' },
      searchEngineHost: { type: 'string', default: 'localhost' },
      searchEnginePort: { type: 'integer', default: 8080 },
      searchEnginePath: { type: 'string', default: MARINER5_HOME },
      apiBasePath: { type: 'string', default: '/api' }
    }
  };
  makeValidator(schema)(input);

  const {
    webManagerPath,
    searchEngineHost = 'localhost',
    searchEnginePort = 8080,
    searchEnginePath = MARINER5_HOME,
    apiBasePath = '/api'
  } = input;

  const commonJspPath = path.join(webManagerPath, 'm5', 'common', 'common.jsp');

  if (!fs.existsSync(commonJspPath)) {
    return fail('E_FILE_NOT_FOUND', `common.jsp 파일을 찾을 수 없습니다: ${commonJspPath}`);
  }

  try {
    let commonJsp = fs.readFileSync(commonJspPath, 'utf-8');

    // 검색엔진 설정 패턴 찾기
    const configPattern = /<%[\s\S]*?String\s+searchEngineHost[\s\S]*?%>/;
    const configMatch = commonJsp.match(configPattern);

    const newConfig = `<%
// 검색엔진 위치 설정 (MCP mariner5-mcp 자동 생성)
String searchEngineHost = "${searchEngineHost}";  // 검색엔진 IP
int searchEnginePort = ${searchEnginePort};           // 검색엔진 PORT
String searchEnginePath = "${searchEnginePath.replace(/\\/g, '\\\\')}";  // 검색엔진 설치 경로
String apiBasePath = "${apiBasePath}";           // API 베이스 경로
%>`;

    if (configMatch) {
      // 기존 설정 교체
      commonJsp = commonJsp.replace(configPattern, newConfig);
    } else {
      // 파일 상단에 추가
      commonJsp = newConfig + '\n' + commonJsp;
    }

    // 파일 저장
    fs.writeFileSync(commonJspPath, commonJsp, 'utf-8');

    return ok('webmanager.commonJsp.configure', input, {
      success: true,
      commonJspPath,
      config: {
        searchEngineHost,
        searchEnginePort,
        searchEnginePath,
        apiBasePath
      },
      message: 'common.jsp 수정 완료.'
    });
  } catch (err) {
    return fail('E_FILE_WRITE', `common.jsp 수정 실패: ${err.message}`);
  }
}

// webManager 자동 설정 (server.xml + common.jsp 한번에)
async function setupWebManager(input) {
  const schema = {
    type: 'object',
    required: ['tomcatPath', 'webManagerPath'],
    properties: {
      tomcatPath: { type: 'string' },
      webManagerPath: { type: 'string' },
      contextPath: { type: 'string', default: '/mariner5' },
      searchEngineHost: { type: 'string', default: 'localhost' },
      searchEnginePort: { type: 'integer', default: 8080 },
      searchEnginePath: { type: 'string', default: MARINER5_HOME },
      apiBasePath: { type: 'string', default: '/api' }
    }
  };
  makeValidator(schema)(input);

  const {
    tomcatPath,
    webManagerPath,
    contextPath = '/mariner5',
    searchEngineHost = 'localhost',
    searchEnginePort = 8080,
    searchEnginePath = MARINER5_HOME,
    apiBasePath = '/api'
  } = input;

  // 1. server.xml 설정
  const serverXmlResult = await configureTomcatServerXml({
    tomcatPath,
    webManagerPath,
    contextPath
  });

  if (!serverXmlResult.success) {
    return serverXmlResult;
  }

  // 2. common.jsp 설정
  const commonJspResult = await configureCommonJsp({
    webManagerPath,
    searchEngineHost,
    searchEnginePort,
    searchEnginePath,
    apiBasePath
  });

  if (!commonJspResult.success) {
    return commonJspResult;
  }

  return ok('webmanager.setup', input, {
    success: true,
    serverXml: serverXmlResult.data,
    commonJsp: commonJspResult.data,
    accessUrl: `http://${searchEngineHost}:${contextPath === '/mariner5' ? '8080' : '9090'}${contextPath}`,
    message: '관리도구 설정 완료. Tomcat 재시작 필요.'
  });
}

// 설정 검증
async function validateWebManagerSetup(input) {
  const schema = {
    type: 'object',
    required: ['tomcatPath', 'webManagerPath'],
    properties: {
      tomcatPath: { type: 'string' },
      webManagerPath: { type: 'string' }
    }
  };
  makeValidator(schema)(input);

  const { tomcatPath, webManagerPath } = input;

  const checks = [];

  // 1. Tomcat 경로 확인
  const tomcatExists = fs.existsSync(tomcatPath);
  checks.push({
    name: 'Tomcat 경로',
    path: tomcatPath,
    exists: tomcatExists,
    status: tomcatExists ? 'OK' : 'FAIL'
  });

  // 2. server.xml 확인
  const serverXmlPath = path.join(tomcatPath, 'conf', 'server.xml');
  const serverXmlExists = fs.existsSync(serverXmlPath);
  checks.push({
    name: 'server.xml',
    path: serverXmlPath,
    exists: serverXmlExists,
    status: serverXmlExists ? 'OK' : 'FAIL'
  });

  // 3. webManager 경로 확인
  const webManagerExists = fs.existsSync(webManagerPath);
  checks.push({
    name: 'webManager 경로',
    path: webManagerPath,
    exists: webManagerExists,
    status: webManagerExists ? 'OK' : 'FAIL'
  });

  // 4. common.jsp 확인
  const commonJspPath = path.join(webManagerPath, 'm5', 'common', 'common.jsp');
  const commonJspExists = fs.existsSync(commonJspPath);
  checks.push({
    name: 'common.jsp',
    path: commonJspPath,
    exists: commonJspExists,
    status: commonJspExists ? 'OK' : 'FAIL'
  });

  const allValid = checks.every(c => c.status === 'OK');

  return ok('webmanager.validate', input, {
    valid: allValid,
    checks,
    message: allValid ? '모든 검증 통과' : '일부 파일/경로 없음'
  });
}

export const webmanager = {
  'webmanager.serverXml.configure': {
    handler: configureTomcatServerXml
  },
  'webmanager.commonJsp.configure': {
    handler: configureCommonJsp
  },
  'webmanager.setup': {
    handler: setupWebManager
  },
  'webmanager.validate': {
    handler: validateWebManagerSetup
  }
};
