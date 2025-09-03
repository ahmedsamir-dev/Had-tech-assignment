import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '@/config/environment';
import * as schema from '@/database/schema';

const client = postgres(env.DATABASE_URL, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  // Convert BigInt to Number for JSON serialization
  types: {
    bigint: postgres.BigInt,
  },
});

export const db = drizzle(client, { schema });

export type Database = typeof db;
