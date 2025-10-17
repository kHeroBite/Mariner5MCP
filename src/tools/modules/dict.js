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
const d = endpointsJson.dict;

function crud(path, nameProp='name') {
  return {
    create: async (input) => {
      const serverName = input?.server || null;
      const adminClient = connectionManager.getClient(serverName);
      const url = BASE_URL + path;
      const res = await http.post(url, input);
      return ok(path, input, res.data);
    },
    update: async (input) => {
      const serverName = input?.server || null;
      const adminClient = connectionManager.getClient(serverName);
      const url = BASE_URL + path;
      const res = await http.put(url, input);
      return ok(path, input, res.data);
    },
    delete: async (input) => {
      const serverName = input?.server || null;
      const adminClient = connectionManager.getClient(serverName);
      const url = BASE_URL + path;
      const res = await http.delete(url, { data: input });
      return ok(path, input, res.data);
    },
    list: async (input) => {
      const serverName = input?.server || null;
      const adminClient = connectionManager.getClient(serverName);
      const url = BASE_URL + path;
      const res = await http.get(url, { params: input||{} });
      return ok(path, input, res.data);
    }
  };
}

export const dict = {
  'dict.recommend.create': { handler: crud(d.recommend).create },
  'dict.recommend.update': { handler: crud(d.recommend).update },
  'dict.recommend.delete': { handler: crud(d.recommend).delete },
  'dict.recommend.list':   { handler: crud(d.recommend).list },

  'dict.redirect.create': { handler: crud(d.redirect).create },
  'dict.redirect.update': { handler: crud(d.redirect).update },
  'dict.redirect.delete': { handler: crud(d.redirect).delete },
  'dict.redirect.list':   { handler: crud(d.redirect).list },

  'dict.stopword.create': { handler: crud(d.stopword).create },
  'dict.stopword.delete': { handler: crud(d.stopword).delete },
  'dict.stopword.list':   { handler: crud(d.stopword).list },

  'dict.userCn.create': { handler: crud(d.userCn).create },
  'dict.userCn.delete': { handler: crud(d.userCn).delete },
  'dict.userCn.list':   { handler: crud(d.userCn).list },

  'dict.documentRanking.create': { handler: crud(d.documentRanking).create },
  'dict.documentRanking.update': { handler: crud(d.documentRanking).update },
  'dict.documentRanking.delete': { handler: crud(d.documentRanking).delete },
  'dict.documentRanking.list':   { handler: crud(d.documentRanking).list }
};
