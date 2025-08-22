#!/usr/bin/env node
// One-off migration: add 'availability' column to properties and optional check constraint
import postgres from 'postgres';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('[migrate] Missing DATABASE_URL');
  process.exit(1);
}

const sql = postgres(url, { max: 1, onnotice: () => {} });

async function main() {
  try {
    console.log('[migrate] Adding availability column…');
    await sql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS availability varchar(20)`;
    // Optional: add a soft check constraint; won't fail if not supported
    try {
      await sql`ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_availability_check`;
      await sql`ALTER TABLE properties ADD CONSTRAINT properties_availability_check CHECK (availability IN ('LET','SOLD','SALE AGREED') OR availability IS NULL)`;
    } catch {}
    console.log('[migrate] Done');
  } catch (e) {
    console.error('[migrate] Failed:', e?.message || e);
    process.exitCode = 1;
  } finally {
    try { await sql.end({ timeout: 1 }); } catch {}
  }
}

main();
