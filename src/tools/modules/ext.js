import dotenv from 'dotenv';
import { http } from '../../http.js';
import { ok, fail, makeValidator, tpl } from '../../utils.js';
import * as extensionBuilder from '../../extension-builder.js';
import { connectionManager } from '../../connection-manager.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const BASE_URL = process.env.BASE_URL || 'http://localhost:8080/api';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const endpointsJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../config/endpoints.json'), 'utf-8'));
const ep = endpointsJson.ext;

const nameSchema = { type: 'object', required: ['name'], properties: { name: { type: 'string' }, server: { type: 'string', description: '대상 서버 이름' } } };

const generateSchema = {
  type: 'object',
  required: ['type', 'name'],
  properties: {
    type: { type: 'string', enum: ['analyzer', 'processor', 'fetcher', 'filter'] },
    name: { type: 'string' },
    className: { type: 'string' },
    packageName: { type: 'string' },
    description: { type: 'string' },
    targetFields: { type: 'array', items: { type: 'string' } },
    server: { type: 'string', description: '대상 서버 이름' },
    options: { type: 'object' },
    activate: { type: 'boolean' }
  }
};

const previewSchema = {
  type: 'object',
  required: ['type', 'name'],
  properties: {
    type: { type: 'string', enum: ['analyzer', 'processor', 'fetcher', 'filter'] },
    name: { type: 'string' },
    className: { type: 'string' },
    packageName: { type: 'string' },
    description: { type: 'string' },
    targetFields: { type: 'array', items: { type: 'string' } },
    server: { type: 'string', description: '대상 서버 이름' },
    options: { type: 'object' }
  }
};

const attachSchema = {
  type: 'object',
  required: ['extension', 'collection'],
  properties: {
    extension: { type: 'string' },
    collection: { type: 'string' },
    server: { type: 'string', description: '대상 서버 이름' },
    fields: { type: 'array', items: { type: 'string' } }
  }
};

export const ext = {
  'ext.java.create': {
    handler: async (input) => {
      const serverName = input?.server || null;
      const adminClient = connectionManager.getClient(serverName);
      const url = BASE_URL + ep.java;
      const res = await http.post(url, input); // expects {name,type,binary(Base64),entryClass,activate,options}
      return ok(ep.java, input, res.data);
    }
  },
  'ext.java.update': {
    handler: async (input) => {
      makeValidator(nameSchema)(input);
      const serverName = input.server || null;
      const adminClient = connectionManager.getClient(serverName);
      const url = BASE_URL + ep.java + '/' + encodeURIComponent(input.name);
      const res = await http.put(url, input);
      return ok(ep.java + '/{name}', input, res.data);
    }
  },
  'ext.java.delete': {
    handler: async (input) => {
      makeValidator(nameSchema)(input);
      const serverName = input.server || null;
      const adminClient = connectionManager.getClient(serverName);
      const url = BASE_URL + ep.java + '/' + encodeURIComponent(input.name);
      const res = await http.delete(url);
      return ok(ep.java + '/{name}', input, res.data);
    }
  },
  'ext.java.list': {
    handler: async (input) => {
      const serverName = input?.server || null;
      const adminClient = connectionManager.getClient(serverName);
      const url = BASE_URL + ep.java;
      const res = await http.get(url);
      return ok(ep.java, input||{}, res.data);
    }
  },
  'ext.java.activate': {
    handler: async (input) => {
      makeValidator(nameSchema)(input);
      const serverName = input.server || null;
      const adminClient = connectionManager.getClient(serverName);
      const url = BASE_URL + ep.java + '/' + encodeURIComponent(input.name) + '/activate';
      const res = await http.post(url, {});
      return ok(ep.java + '/{name}/activate', input, res.data);
    }
  },
  'ext.java.deactivate': {
    handler: async (input) => {
      makeValidator(nameSchema)(input);
      const serverName = input.server || null;
      const adminClient = connectionManager.getClient(serverName);
      const url = BASE_URL + ep.java + '/' + encodeURIComponent(input.name) + '/deactivate';
      const res = await http.post(url, {});
      return ok(ep.java + '/{name}/deactivate', input, res.data);
    }
  },

  'ext.templates': {
    handler: async (input) => {
      try {
        const serverName = input?.server || null;
        const adminClient = connectionManager.getClient(serverName);
        const templates = extensionBuilder.listAvailableTemplates();
        return ok('/extensions/templates', input||{}, {
          templates,
          count: templates.length,
          types: ['analyzer', 'processor', 'fetcher', 'filter']
        });
      } catch (error) {
        return fail('E_TOOL', '템플릿 조회 실패', { error: error.message });
      }
    }
  },

  'ext.preview': {
    handler: async (input) => {
      try {
        const serverName = input?.server || null;
        const adminClient = connectionManager.getClient(serverName);
        makeValidator(previewSchema)(input);
        const source = extensionBuilder.previewExtension(input);
        return ok('/extensions/preview', input, {
          source,
          lines: source.split('\n').length,
          type: input.type,
          name: input.name
        });
      } catch (error) {
        return fail('E_TOOL', 'Extension 미리보기 실패', { error: error.message });
      }
    }
  },

  'ext.generate': {
    handler: async (input) => {
      try {
        const serverName = input?.server || null;
        const adminClient = connectionManager.getClient(serverName);
        makeValidator(generateSchema)(input);

        // Extension 생성 및 컴파일
        const result = await extensionBuilder.generateExtension(input);

        // Mariner5에 등록
        const extensionData = {
          name: input.name,
          type: input.type,
          binary: result.binary,
          entryClass: `${result.packageName}.${result.className}`,
          activate: input.activate !== false,
          options: input.options || {}
        };

        const url = BASE_URL + ep.java;
        let registrationResult = null;
        try {
          const res = await http.post(url, extensionData);
          registrationResult = res.data;
        } catch (regError) {
          // 등록 실패는 경고로만 처리 (컴파일은 성공했으므로)
          console.error('[ext.generate] Mariner5 등록 실패:', regError.message);
        }

        return ok(ep.java, input, {
          ...result,
          registered: !!registrationResult,
          registrationResult: registrationResult || { note: '등록 시도했으나 Mariner5 서버 응답 없음' }
        });
      } catch (error) {
        return fail('E_TOOL', 'Extension 생성 실패', {
          error: error.message,
          stack: error.stack
        });
      }
    }
  },

  'ext.attachToCollection': {
    handler: async (input) => {
      try {
        const serverName = input?.server || null;
        const adminClient = connectionManager.getClient(serverName);
        makeValidator(attachSchema)(input);

        // REST API를 통해 Extension을 컬렉션에 연결
        const url = BASE_URL + `/collections/${encodeURIComponent(input.collection)}/extensions/${encodeURIComponent(input.extension)}`;
        const res = await http.post(url, {
          fields: input.fields || []
        });

        return ok(url, input, {
          extension: input.extension,
          collection: input.collection,
          fields: input.fields || [],
          attached: true
        });
      } catch (error) {
        return fail('E_TOOL', 'Extension 연결 실패', { error: error.message });
      }
    }
  },

  'ext.detachFromCollection': {
    handler: async (input) => {
      try {
        const serverName = input?.server || null;
        const adminClient = connectionManager.getClient(serverName);
        makeValidator(attachSchema)(input);

        const url = BASE_URL + `/collections/${encodeURIComponent(input.collection)}/extensions/${encodeURIComponent(input.extension)}`;
        const res = await http.delete(url);

        return ok(url, input, {
          extension: input.extension,
          collection: input.collection,
          detached: true
        });
      } catch (error) {
        return fail('E_TOOL', 'Extension 연결 해제 실패', { error: error.message });
      }
    }
  }
};
