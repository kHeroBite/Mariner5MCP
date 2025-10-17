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
const ep = endpointsJson.ext;

const nameSchema = { type: 'object', required: ['name'], properties: { name: { type: 'string' } } };

export const ext = {
  'ext.java.create': {
    handler: async (input) => {
      const url = BASE_URL + ep.java;
      const res = await http.post(url, input); // expects {name,type,binary(Base64),entryClass,activate,options}
      return ok(ep.java, input, res.data);
    }
  },
  'ext.java.update': {
    handler: async (input) => {
      makeValidator(nameSchema)(input);
      const url = BASE_URL + ep.java + '/' + encodeURIComponent(input.name);
      const res = await http.put(url, input);
      return ok(ep.java + '/{name}', input, res.data);
    }
  },
  'ext.java.delete': {
    handler: async (input) => {
      makeValidator(nameSchema)(input);
      const url = BASE_URL + ep.java + '/' + encodeURIComponent(input.name);
      const res = await http.delete(url);
      return ok(ep.java + '/{name}', input, res.data);
    }
  },
  'ext.java.list': {
    handler: async () => {
      const url = BASE_URL + ep.java;
      const res = await http.get(url);
      return ok(ep.java, {}, res.data);
    }
  },
  'ext.java.activate': {
    handler: async (input) => {
      makeValidator(nameSchema)(input);
      const url = BASE_URL + ep.java + '/' + encodeURIComponent(input.name) + '/activate';
      const res = await http.post(url, {});
      return ok(ep.java + '/{name}/activate', input, res.data);
    }
  },
  'ext.java.deactivate': {
    handler: async (input) => {
      makeValidator(nameSchema)(input);
      const url = BASE_URL + ep.java + '/' + encodeURIComponent(input.name) + '/deactivate';
      const res = await http.post(url, {});
      return ok(ep.java + '/{name}/deactivate', input, res.data);
    }
  }
};
