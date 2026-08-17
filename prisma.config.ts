import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // Migrations need a direct connection — DDL through Neon's pgbouncer pooler
    // is unreliable. Runtime keeps the pooled URL (see src/lib/prisma.ts).
    // Falls back for setups with a single, non-pooled database.
    url: process.env['DATABASE_URL_UNPOOLED'] ?? process.env['DATABASE_URL'],
  },
});
