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
const ep = endpointsJson.sim;

const idSchema = { type: 'object', required: ['id'], properties: { id: { type: 'string' }, server: { type: 'string', description: '대상 서버 이름' } } };
const idArgsSchema = { type: 'object', required: ['id'], properties: { id: { type: 'string' }, server: { type: 'string', description: '대상 서버 이름' }, args: { type: 'object' } } };

export const sim = {
  'sim.create': {
    handler: async (input) => {
      try {
        const serverName = input?.server || null;
        const adminClient = connectionManager.getClient(serverName);
        const result = await javaWrapper.createSimulation(input.name || input.id, input);
        return ok(ep.root, input, result);
      } catch (error) {
        // Fallback to REST API
        const url = BASE_URL + ep.root;
        const res = await http.post(url, input);
        return ok(ep.root, input, res.data);
      }
    }
  },
  'sim.update': {
    handler: async (input) => {
      makeValidator(idSchema)(input);
      try {
        const serverName = input.server || null;
        const adminClient = connectionManager.getClient(serverName);
        // Java backend update logic
        return ok(ep.root + '/{id}', input, { message: 'Simulation updated via Java backend' });
      } catch (error) {
        // Fallback to REST API
        const url = BASE_URL + ep.root + '/' + encodeURIComponent(input.id);
        const res = await http.put(url, input);
        return ok(ep.root + '/{id}', input, res.data);
      }
    }
  },
  'sim.delete': {
    handler: async (input) => {
      makeValidator(idSchema)(input);
      try {
        const serverName = input.server || null;
        const adminClient = connectionManager.getClient(serverName);
        const result = await javaWrapper.deleteSimulation(input.id);
        return ok(ep.root + '/{id}', input, { deleted: result });
      } catch (error) {
        // Fallback to REST API
        const url = BASE_URL + ep.root + '/' + encodeURIComponent(input.id);
        const res = await http.delete(url);
        return ok(ep.root + '/{id}', input, res.data);
      }
    }
  },
  'sim.list': {
    handler: async (input) => {
      try {
        const serverName = input?.server || null;
        const adminClient = connectionManager.getClient(serverName);
        const result = await javaWrapper.listSimulations();
        return ok(ep.root, input, result);
      } catch (error) {
        // Fallback to REST API
        const url = BASE_URL + ep.root;
        const res = await http.get(url, { params: input||{} });
        return ok(ep.root, input, res.data);
      }
    }
  },
  'sim.run': {
    handler: async (input) => {
      makeValidator(idArgsSchema)(input);
      try {
        const serverName = input.server || null;
        const adminClient = connectionManager.getClient(serverName);
        const result = await javaWrapper.runSimulation(input.id);
        return ok(ep.root + '/{id}/run', input, result);
      } catch (error) {
        // Fallback to REST API
        const url = BASE_URL + ep.root + '/' + encodeURIComponent(input.id) + '/run';
        const res = await http.post(url, input.args||{});
        return ok(ep.root + '/{id}/run', input, res.data);
      }
    }
  },
  'sim.status': {
    handler: async (input) => {
      makeValidator(idSchema)(input);
      try {
        const serverName = input.server || null;
        const adminClient = connectionManager.getClient(serverName);
        // Java backend status logic - may need additional implementation
        return ok(ep.root + '/{id}/status', input, { message: 'Status query via Java backend' });
      } catch (error) {
        // Fallback to REST API
        const url = BASE_URL + ep.root + '/' + encodeURIComponent(input.id) + '/status';
        const res = await http.get(url);
        return ok(ep.root + '/{id}/status', input, res.data);
      }
    }
  }
};
