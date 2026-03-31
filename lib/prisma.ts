import { neon } from '@neondatabase/serverless';

const connectionString =
  process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL || '';

export const sql = connectionString ? neon(connectionString) : null;

// TODO: swap this fallback with a generated Prisma client once prisma engines are available in the target environment.
export const prisma = {} as any;
