import { Database } from './schema';

/**
 * @deprecated REAL_DATA_ONLY: Seed data is disabled.
 * System must use real API/database sources only.
 * For development, use proper database initialization.
 */

const now = new Date().toISOString();

export const initialSeedData: Database = {
  merchants: [],
  products: [],
  orders: [],
  agents: []
};
