import { mysqlTable, varchar, json, boolean } from 'drizzle-orm/mysql-core';
import { uuidPk } from './_helpers.js';

export const printers = mysqlTable('printers', {
  id: uuidPk(),
  name: varchar('name', { length: 255 }).notNull(),
  apiEndpoint: varchar('api_endpoint', { length: 500 }),
  capabilities: json('capabilities').default({}),
  active: boolean('active').default(true).notNull(),
});
