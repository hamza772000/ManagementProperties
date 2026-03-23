#!/usr/bin/env node
// One-off migration: add 'reference' column to properties
import postgres from 'postgres';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('[migrate] Missing DATABASE_URL');
  process.exit(1);
}

const sql = postgres(url, { max: 1, onnotice: () => {} });

async function main() {
  try {
    console.log('[migrate] Adding reference column…');
    await sql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS reference varchar(100)`;
    console.log('[migrate] Done');
  } catch (e) {
    console.error('[migrate] Failed:', e?.message || e);
    process.exitCode = 1;
  } finally {
    try { await sql.end({ timeout: 1 }); } catch {}
  }
}

main();
