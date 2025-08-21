#!/usr/bin/env node
// One-off migration: allow 'commercial' in properties.status check constraint
import postgres from 'postgres';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('[migrate] Missing DATABASE_URL');
  process.exit(1);
}

const sql = postgres(url, { max: 1, onnotice: () => {} });

async function main() {
  try {
    console.log('[migrate] Updating properties_status_check to include commercial…');
    await sql`ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_status_check`;
    await sql`ALTER TABLE properties ADD CONSTRAINT properties_status_check CHECK (status IN ('rent','sale','commercial'))`;
    console.log('[migrate] Done');
  } catch (e) {
    console.error('[migrate] Failed:', e?.message || e);
    process.exitCode = 1;
  } finally {
    try { await sql.end({ timeout: 1 }); } catch {}
  }
}

main();
