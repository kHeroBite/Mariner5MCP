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
const ep = endpointsJson.index;

export const indexCtl = {
  'index.run': {
    handler: async (input) => {
      makeValidator({
        type:'object',
        required:['collection','type'],
        properties: {
          collection:{type:'string'},
          type:{ type:'string', enum:['full','inc','rebuild','rebuild_all','update','take_snapshot','revert_snapshot','pipe','index_sync_all'] },
          snapshotName:{type:'string'},
          options:{type:'object'}
        }
      })(input);
      const url = BASE_URL + ep.run;
      const res = await http.post(url, null, { params: {
        collection: input.collection,
        type: input.type,
        snapshotName: input.snapshotName,
        ...(input.options||{})
      }});
      return ok(ep.run, input, res.data);
    }
  },
  'index.status': {
    handler: async (input) => {
      const url = BASE_URL + ep.logs;
      const res = await http.get(url, { params: input||{} });
      return ok(ep.logs, input, res.data);
    }
  }
};
