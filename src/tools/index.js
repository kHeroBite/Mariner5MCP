import { collections } from './modules/collections.js';
import { columns } from './modules/columns.js';
import { queries } from './modules/queries.js';
import { dict } from './modules/dict.js';
import { dictAdvanced } from './modules/dict-advanced.js';
import { indexCtl } from './modules/index.js';
import { serverCtl } from './modules/server.js';
import { logs } from './modules/logs.js';
import { sim } from './modules/sim.js';
import { ext } from './modules/ext.js';
import { codegen } from './modules/codegen.js';
import { search } from './modules/search.js';
import { schemaFromSql } from './modules/schema-from-sql.js';
import { servers } from './modules/servers.js';
import { admin } from './modules/admin.js';
import { hotKeyword } from './modules/hotKeyword.js';
import { monitoring } from './modules/monitoring.js';
import { tuning } from './modules/tuning.js';
import { datasource } from './modules/datasource.js';
import { collectionMonitor } from './modules/collection-monitor.js';
import { advancedSearch } from './modules/advanced-search.js';
import { advancedFeatures } from './modules/advanced-features.js';
import { queryBuilder } from './modules/query-builder-tools.js';
import { analyzerTools } from './modules/analyzer-tools.js';
import { sortTools } from './modules/sort-tools.js';
import { setup } from './modules/setup.js';
import { webmanager } from './modules/webmanager.js';

export const tools = {
  ...collections,
  ...columns,
  ...queries,
  ...dict,
  ...dictAdvanced,
  ...indexCtl,
  ...serverCtl,
  ...logs,
  ...sim,
  ...ext,
  ...codegen,
  ...search,
  ...schemaFromSql,
  ...servers,
  ...admin,
  ...hotKeyword,
  ...monitoring,
  ...tuning,
  ...datasource,
  ...collectionMonitor,
  ...advancedSearch,
  ...advancedFeatures,
  ...queryBuilder,
  ...analyzerTools,
  ...sortTools,
  ...setup,
  ...webmanager
};
