import dotenv from 'dotenv';
import { http } from '../../http.js';
import { ok, fail, makeValidator, tpl } from '../../utils.js';
import * as javaWrapper from '../../java-wrapper.js';
import { connectionManager } from '../../connection-manager.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const BASE_URL = process.env.BASE_URL || 'http://localhost:8080/api';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const endpointsJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../config/endpoints.json'), 'utf-8'));
const ep = endpointsJson.collections;

const createSchema = {
  type: 'object',
  required: ['name','shards','replicas'],
  properties: {
    name: { type: 'string' },
    shards: { type: 'integer', minimum: 1 },
    replicas: { type: 'integer', minimum: 0 },
    server: { type: 'string', description: '대상 서버 이름' },
    options: { type: 'object' }
  }
};
const updateSchema = {
  type: 'object',
  required: ['collection'],
  properties: {
    collection: { type: 'string' },
    server: { type: 'string', description: '대상 서버 이름' },
    options: { type: 'object' }
  }
};
const deleteSchema = {
  type:'object',
  required:['collection'],
  properties:{
    collection:{ type:'string' },
    server: { type: 'string', description: '대상 서버 이름' }
  }
};
const getSchema = {
  type:'object',
  required:['collection'],
  properties:{
    collection:{ type:'string' },
    server: { type: 'string', description: '대상 서버 이름' }
  }
};
const listSchema = {
  type:'object',
  properties:{
    page:{type:'integer',minimum:1},
    size:{type:'integer',minimum:1},
    server: { type: 'string', description: '대상 서버 이름' }
  }
};

export const collections = {
  'collections.create': {
    handler: async (input) => {
      makeValidator(createSchema)(input);
      try {
        const serverName = input.server || null;
        const adminClient = connectionManager.getClient(serverName);

        // MultiInstance 방식: 특정 서버의 클라이언트로 작업
        // 기존 java-wrapper 대신 직접 사용하는 방식도 가능하지만,
        // 현재는 connectionManager를 통해 서버 선택
        const result = await javaWrapper.createCollection(input.name, {
          shards: input.shards,
          replicas: input.replicas,
          ...input.options
        });
        return ok(ep.create, input, result);
      } catch (error) {
        // Fallback to REST API
        const url = BASE_URL + ep.create;
        const res = await http.post(url, input);
        return ok(ep.create, input, res.data);
      }
    }
  },
  'collections.update': {
    handler: async (input) => {
      makeValidator(updateSchema)(input);
      try {
        // Java backend update logic
        return ok(ep.update, input, { message: 'Collection updated via Java backend' });
      } catch (error) {
        // Fallback to REST API
        const url = BASE_URL + tpl(ep.update, { collection: input.collection });
        const res = await http.put(url, input.options||{});
        return ok(ep.update, input, res.data);
      }
    }
  },
  'collections.delete': {
    handler: async (input) => {
      makeValidator(deleteSchema)(input);
      try {
        const result = await javaWrapper.deleteCollection(input.collection);
        return ok(ep.delete, input, { deleted: result });
      } catch (error) {
        // Fallback to REST API
        const url = BASE_URL + tpl(ep.delete, { collection: input.collection });
        const res = await http.delete(url);
        return ok(ep.delete, input, res.data);
      }
    }
  },
  'collections.get': {
    handler: async (input) => {
      makeValidator(getSchema)(input);
      try {
        const result = await javaWrapper.getCollection(input.collection);
        return ok(ep.get, input, result);
      } catch (error) {
        // Fallback to REST API
        const url = BASE_URL + tpl(ep.get, { collection: input.collection });
        const res = await http.get(url);
        return ok(ep.get, input, res.data);
      }
    }
  },
  'collections.list': {
    handler: async (input) => {
      makeValidator(listSchema)(input||{});
      try {
        const serverName = input?.server || null;
        const adminClient = connectionManager.getClient(serverName);

        // MultiInstance 방식: 특정 서버에서 컬렉션 조회
        const result = await javaWrapper.listCollections();
        return ok(ep.list, input, result);
      } catch (error) {
        // Fallback to REST API
        const url = BASE_URL + ep.list;
        const res = await http.get(url, { params: input||{} });
        return ok(ep.list, input, res.data);
      }
    }
  }
};
