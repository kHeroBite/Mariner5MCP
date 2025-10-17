import { collections } from './modules/collections.js';
import { columns } from './modules/columns.js';
import { queries } from './modules/queries.js';
import { dict } from './modules/dict.js';
import { indexCtl } from './modules/index.js';
import { serverCtl } from './modules/server.js';
import { logs } from './modules/logs.js';
import { sim } from './modules/sim.js';
import { ext } from './modules/ext.js';
import { codegen } from './modules/codegen.js';
import { search } from './modules/search.js';

export const tools = {
  ...collections,
  ...columns,
  ...queries,
  ...dict,
  ...indexCtl,
  ...serverCtl,
  ...logs,
  ...sim,
  ...ext,
  ...codegen,
  ...search
};
