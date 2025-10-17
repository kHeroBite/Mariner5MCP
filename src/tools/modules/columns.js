import dotenv from 'dotenv';
import { http } from '../../http.js';
import { ok, fail, makeValidator, tpl } from '../../utils.js';
import { connectionManager } from '../../connection-manager.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const BASE_URL = process.env.BASE_URL || 'http://localhost:8080/api';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const endpointsJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../config/endpoints.json'), 'utf-8'));
const ep = endpointsJson.collections;

const addSchema = {
  type: 'object',
  required: ['collection','field','type'],
  properties: {
    collection: { type: 'string' },
    field: { type: 'string' },
    type: { type: 'string' },
    analyzer: { type: 'string' },
    stored: { type: 'boolean' },
    indexed: { type: 'boolean' },
    server: { type: 'string', description: '대상 서버 이름' },
    options: { type: 'object' }
  }
};
const updateSchema = {
  type: 'object',
  required: ['collection','field'],
  properties: {
    collection: { type: 'string' },
    field: { type: 'string' },
    server: { type: 'string', description: '대상 서버 이름' },
    changes: { type: 'object' }
  }
};
const deleteSchema = { type:'object', required:['collection','field'], properties:{
  collection:{type:'string'}, field:{type:'string'}, server: { type: 'string', description: '대상 서버 이름' }
}};
const listSchema = { type:'object', required:['collection'], properties:{
  collection:{type:'string'}, server: { type: 'string', description: '대상 서버 이름' }
}};

export const columns = {
  'columns.add': {
    handler: async (input) => {
      makeValidator(addSchema)(input);
      const serverName = input.server || null;
      const adminClient = connectionManager.getClient(serverName);
      const url = BASE_URL + tpl(ep.schemaFields, { collection: input.collection });
      const res = await http.post(url, {
        field: input.field,
        type: input.type,
        analyzer: input.analyzer,
        stored: input.stored,
        indexed: input.indexed,
        options: input.options || {}
      });
      return ok(ep.schemaFields, input, res.data);
    }
  },
  'columns.update': {
    handler: async (input) => {
      makeValidator(updateSchema)(input);
      const serverName = input.server || null;
      const adminClient = connectionManager.getClient(serverName);
      const url = BASE_URL + tpl(ep.schemaFields, { collection: input.collection });
      const res = await http.put(url, { field: input.field, changes: input.changes||{} });
      return ok(ep.schemaFields, input, res.data);
    }
  },
  'columns.delete': {
    handler: async (input) => {
      makeValidator(deleteSchema)(input);
      const serverName = input.server || null;
      const adminClient = connectionManager.getClient(serverName);
      const url = BASE_URL + tpl(ep.schemaFields, { collection: input.collection });
      const res = await http.delete(url, { data: { field: input.field } });
      return ok(ep.schemaFields, input, res.data);
    }
  },
  'columns.list': {
    handler: async (input) => {
      makeValidator(listSchema)(input);
      const serverName = input.server || null;
      const adminClient = connectionManager.getClient(serverName);
      const url = BASE_URL + tpl(ep.schemaFields, { collection: input.collection });
      const res = await http.get(url);
      return ok(ep.schemaFields, input, res.data);
    }
  }
};
