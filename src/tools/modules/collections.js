import dotenv from 'dotenv';
import { http } from '../../http.js';
import { ok, fail, makeValidator, tpl } from '../../utils.js';
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
    options: { type: 'object' }
  }
};
const updateSchema = {
  type: 'object',
  required: ['collection'],
  properties: {
    collection: { type: 'string' },
    options: { type: 'object' }
  }
};
const deleteSchema = { type:'object', required:['collection'], properties:{ collection:{ type:'string' } } };
const getSchema = deleteSchema;
const listSchema = { type:'object', properties:{ page:{type:'integer',minimum:1}, size:{type:'integer',minimum:1} } };

export const collections = {
  'collections.create': {
    handler: async (input) => {
      makeValidator(createSchema)(input);
      const url = BASE_URL + ep.create;
      const res = await http.post(url, input);
      return ok(ep.create, input, res.data);
    }
  },
  'collections.update': {
    handler: async (input) => {
      makeValidator(updateSchema)(input);
      const url = BASE_URL + tpl(ep.update, { collection: input.collection });
      const res = await http.put(url, input.options||{});
      return ok(ep.update, input, res.data);
    }
  },
  'collections.delete': {
    handler: async (input) => {
      makeValidator(deleteSchema)(input);
      const url = BASE_URL + tpl(ep.delete, { collection: input.collection });
      const res = await http.delete(url);
      return ok(ep.delete, input, res.data);
    }
  },
  'collections.get': {
    handler: async (input) => {
      makeValidator(getSchema)(input);
      const url = BASE_URL + tpl(ep.get, { collection: input.collection });
      const res = await http.get(url);
      return ok(ep.get, input, res.data);
    }
  },
  'collections.list': {
    handler: async (input) => {
      makeValidator(listSchema)(input||{});
      const url = BASE_URL + ep.list;
      const res = await http.get(url, { params: input||{} });
      return ok(ep.list, input, res.data);
    }
  }
};
