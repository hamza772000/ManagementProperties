#!/usr/bin/env node
/**
 * Build-time script to generate a static JSON snapshot of active properties.
 * Output: public/properties-generated.json
 */
import fs from 'fs';
import path from 'path';
import postgres from 'postgres';

const outFile = path.resolve(process.cwd(), 'public', 'properties-generated.json');

function log(msg) { console.log(`[generate-properties] ${msg}`); }

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    log('DATABASE_URL not set; writing empty array.');
    fs.writeFileSync(outFile, '[]');
    return;
  }
  let sql;
  try {
    sql = postgres(url, { max: 1, onnotice: () => {} });
    const rows = await sql`
  SELECT id, title, address, area, price, price_unit, sale_price_unit, status, availability, beds, baths, featured, lat, lng, images, description, active, created_at
      FROM properties
      WHERE active = true
      ORDER BY created_at DESC
    `;
    let missingImages = 0;
    const data = rows.map(r => {
      let images = r.images;
      if (typeof images === 'string') {
        try { images = JSON.parse(images); } catch { images = []; }
      }
      if (!Array.isArray(images)) images = [];
      images = images.filter(x => typeof x === 'string' && x.trim());
      if (!images.length) missingImages++;
      const isRent = r.status === 'rent';
      const isSale = r.status === 'sale';
      const isCommercial = r.status === 'commercial';
      return {
        id: r.id,
        title: r.title,
        address: r.address || '',
        area: r.area || '',
        price: Number(r.price),
        priceUnit: isRent ? r.price_unit : isCommercial ? (r.price_unit || undefined) : undefined,
        salePriceUnit: isSale ? (r.sale_price_unit || undefined) : isCommercial ? (r.sale_price_unit || undefined) : undefined,
        status: r.status,
        availability: r.availability || undefined,
        beds: Number(r.beds ?? 0),
        baths: Number(r.baths ?? 0),
        featured: !!r.featured,
        coord: [Number(r.lat) || 0, Number(r.lng) || 0],
        images,
        img: images[0] || '',
        description: r.description || ''
      };
    });
    if (missingImages) log(`Note: ${missingImages} properties had no images.`);
    fs.writeFileSync(outFile, JSON.stringify(data, null, 2));
    log(`Wrote ${data.length} properties to ${path.relative(process.cwd(), outFile)}`);
  } catch (e) {
    log('Failed to generate properties JSON: ' + (e?.message || e));
    fs.writeFileSync(outFile, '[]');
  } finally {
    try { await sql?.end({ timeout: 1 }); } catch {}
  }
}

main();
