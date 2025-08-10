import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';

const SHEET_ID = process.env.GOOGLE_SHEETS_ID!;
const SHEET_NAME = process.env.GOOGLE_SHEET_NAME || 'properties';

const auth = new google.auth.JWT(
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  undefined,
  (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  ['https://www.googleapis.com/auth/spreadsheets']
);
const sheets = google.sheets({ version: 'v4', auth });

const ok = (res: VercelResponse, data: any, status = 200) => res.status(status).json(data);
const bad = (res: VercelResponse, msg: string, status = 400) => res.status(status).json({ error: msg });

function authed(req: VercelRequest) {
  const t = (req.headers.authorization || '').replace('Bearer ', '');
  return t && t === process.env.ADMIN_TOKEN;
}

const toBool = (v: any) => String(v).trim().toLowerCase() === 'true' || v === '1' || v === 'yes';

function toDirectDriveUrl(u?: string) {
  if (!u) return u;
  const m = u.match(/\/d\/([^/]+)/); // https://drive.google.com/file/d/<id>/view
  return m?.[1] ? `https://drive.google.com/uc?export=view&id=${m[1]}` : u;
}

function splitUrls(s?: string) {
  if (!s) return [];
  return s.split(/[,|\n]/).map(x => x.trim()).filter(Boolean);
}

// Normalize row -> your frontend camelCase structure
function normalize(row: Record<string, any>) {
  const images: string[] = [];
  for (let i = 1; i <= 6; i++) {
    const k = i === 1 ? 'image_url' : `image_url_${i}`;
    if (row[k]) images.push(toDirectDriveUrl(String(row[k]))!);
  }
  splitUrls(row.images_csv).forEach(u => images.push(toDirectDriveUrl(u)!));
  const dedup = Array.from(new Set(images));

  return {
    id: Number(row.id),
    title: row.title || '',
    address: row.address || '',
    area: row.area || '',
    price: Number(row.price || 0),
    priceUnit: (row.price_unit || 'pcm') as 'pcm' | 'pa',
    status: (row.status || '').toLowerCase() as 'rent' | 'sale',
    beds: Number(row.beds || 0),
    baths: Number(row.baths || 0),
    featured: toBool(row.featured),
    coord: [Number(row.lat || 0), Number(row.lng || 0)] as [number, number],
    // images
    images: dedup,
    img: dedup[0] || '',
    // extra fields
    active: row.active === undefined ? true : toBool(row.active),
    createdAt: row.created_at || new Date().toISOString(),
    description: row.description || '',
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS (handy if you ever admin from another origin)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const range = `${SHEET_NAME}!A1:Z10000`;
    const r = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range });
    const values = r.data.values || [];
    const [header, ...rows] = values;
    const items = rows.map((row) => {
      const o: Record<string, any> = {};
      header.forEach((h, i) => (o[h] = row[i]));
      return normalize(o);
    });
    return ok(res, items.filter(i => i.active));
  }

  if (req.method === 'POST') {
    if (!authed(req)) return bad(res, 'unauthorized', 401);
    const payload = req.body || {};
    if (!payload.title || !payload.price || !payload.status || !payload.priceUnit)
      return bad(res, 'missing required fields: title, price, status, priceUnit');

    // map back to sheet columns
    const header = [
      'id','title','address','area','price','price_unit','status',
      'beds','baths','featured','lat','lng',
      'image_url','image_url_2','image_url_3','image_url_4','image_url_5','image_url_6',
      'images_csv','active','created_at','description'
    ];

    const id = payload.id || Date.now();
    const images: string[] = (payload.images || []).slice(0, 6);
    const row = [
      id,
      payload.title || '',
      payload.address || '',
      payload.area || '',
      Number(payload.price || 0),
      payload.priceUnit || 'pcm',
      payload.status || 'rent',
      Number(payload.beds || 0),
      Number(payload.baths || 0),
      payload.featured ? 'TRUE' : 'FALSE',
      Number(payload.coord?.[0] ?? payload.lat ?? 0),
      Number(payload.coord?.[1] ?? payload.lng ?? 0),
      images[0] || '', images[1] || '', images[2] || '', images[3] || '', images[4] || '', images[5] || '',
      '', // images_csv not used on POST
      'TRUE',
      new Date().toISOString(),
      payload.description || ''
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: SHEET_NAME,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] },
    });

    return ok(res, { id }, 201);
  }

  if (req.method === 'PATCH') {
    // Soft delete: set active = FALSE by id
    if (!authed(req)) return bad(res, 'unauthorized', 401);
    const id = String((req.body || {}).id || req.query.id || '');
    if (!id) return bad(res, 'missing id');

    const r = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: `${SHEET_NAME}!A1:Z10000` });
    const values = r.data.values || [];
    const [header, ...rows] = values;
    const idIdx = header.indexOf('id');
    const activeIdx = header.indexOf('active');
    if (idIdx < 0 || activeIdx < 0) return bad(res, 'sheet missing id/active columns', 500);

    const rowIndex = rows.findIndex((row) => String(row[idIdx]) === id);
    if (rowIndex < 0) return bad(res, 'id not found', 404);

    const colLetter = String.fromCharCode(65 + activeIdx); // crude A..Z (fits our headers)
    const targetRange = `${SHEET_NAME}!${colLetter}${rowIndex + 2}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: targetRange,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [['FALSE']] },
    });

    return ok(res, { id, active: false });
  }

  return bad(res, 'method not allowed', 405);
}
