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
const ep = endpointsJson.server;

export const serverCtl = {
  'server.setProps': {
    handler: async (input) => {
      const url = BASE_URL + ep.setProps;
      const res = await http.post(url, input||{});
      return ok(ep.setProps, input, res.data);
    }
  },
  'server.health': {
    handler: async () => {
      const url = BASE_URL + ep.health;
      const res = await http.get(url);
      return ok(ep.health, {}, res.data);
    }
  }
};
