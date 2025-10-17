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
const ep = endpointsJson.logs;

export const logs = {
  'logs.error.get': {
    handler: async (input) => {
      const url = BASE_URL + ep.error;
      const res = await http.get(url, { params: input||{} });
      return ok(ep.error, input, res.data);
    }
  },
  'logs.error.delete': {
    handler: async (input) => {
      const url = BASE_URL + ep.error + '/delete';
      const res = await http.post(url, { data: input?.data||[] });
      return ok(ep.error + '/delete', input, res.data);
    }
  },
  'logs.error.deleteAll': {
    handler: async () => {
      const url = BASE_URL + ep.error + '/deleteAll';
      const res = await http.post(url);
      return ok(ep.error + '/deleteAll', {}, res.data);
    }
  },
  'logs.index.get': {
    handler: async (input) => {
      const url = BASE_URL + '/logs/index';
      const res = await http.get(url, { params: input||{} });
      return ok('/logs/index', input, res.data);
    }
  }
};
