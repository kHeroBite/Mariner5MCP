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

const base = {
  type: 'object',
  required: ['collection'],
  properties: { collection:{type:'string'} }
};
export const queries = {
  'queries.create': {
    handler: async (input) => {
      makeValidator({
        type:'object',
        required:['collection','queryName','query'],
        properties: {
          collection:{type:'string'},
          queryName:{type:'string'},
          query:{type:'object'},
          tags:{type:'array', items:{type:'string'}}
        }
      })(input);
      const url = BASE_URL + tpl(ep.queries, { collection: input.collection });
      const res = await http.post(url, { name: input.queryName, query: input.query, tags: input.tags||[] });
      return ok(ep.queries, input, res.data);
    }
  },
  'queries.update': {
    handler: async (input) => {
      makeValidator({
        type:'object',
        required:['collection','queryName','query'],
        properties: { collection:{type:'string'}, queryName:{type:'string'}, query:{type:'object'} }
      })(input);
      const url = BASE_URL + tpl(ep.queries, { collection: input.collection });
      const res = await http.put(url, { name: input.queryName, query: input.query });
      return ok(ep.queries, input, res.data);
    }
  },
  'queries.delete': {
    handler: async (input) => {
      makeValidator({ type:'object', required:['collection','queryName'], properties:{ collection:{type:'string'}, queryName:{type:'string'} } })(input);
      const url = BASE_URL + tpl(ep.queries, { collection: input.collection });
      const res = await http.delete(url, { data: { name: input.queryName } });
      return ok(ep.queries, input, res.data);
    }
  },
  'queries.list': {
    handler: async (input) => {
      makeValidator(base)(input);
      const url = BASE_URL + tpl(ep.queries, { collection: input.collection });
      const res = await http.get(url);
      return ok(ep.queries, input, res.data);
    }
  },
  'queries.test': {
    handler: async (input) => {
      makeValidator({ type:'object', required:['collection','query'], properties:{ collection:{type:'string'}, query:{type:'object'} } })(input);
      const url = BASE_URL + endpointsJson.search.query;
      const res = await http.post(url, { querySet: input.query });
      return ok(endpointsJson.search.query, input, res.data, { mode: 'dry-run' });
    }
  }
};
