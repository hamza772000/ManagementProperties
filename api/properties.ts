import { google } from 'googleapis';

const SHEET_ID   = (process.env.GOOGLE_SHEETS_ID   || '').trim();
const SHEET_NAME = (process.env.GOOGLE_SHEET_NAME  || 'properties').trim();
const SA_EMAIL   = (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '').trim();
const SA_KEY_RAW = (process.env.GOOGLE_PRIVATE_KEY || '').trim();

if (!SA_EMAIL)  throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_EMAIL');
if (!SA_KEY_RAW) throw new Error('Missing GOOGLE_PRIVATE_KEY');
if (!SHEET_ID)  throw new Error('Missing GOOGLE_SHEETS_ID');

const auth = new google.auth.JWT({
  email: SA_EMAIL,
  key: SA_KEY_RAW,
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
    // optional but useful if you later pull Drive-hosted images:
    'https://www.googleapis.com/auth/drive.readonly',
  ],
});

async function getSheets() {
  // 🔎 Force a token now so we fail here (not later)
  await auth.authorize().catch((e: any) => {
    console.error('Service account auth failed:', e?.response?.data || e);
    throw e;
  });

  // Globally set auth (avoids any per-client weirdness)
  google.options({ auth });
  return google.sheets({ version: 'v4', auth });
}

const ok  = (res: any, data: any, status = 200) => res.status(status).json(data);
const bad = (res: any, msg: string, status = 400) => res.status(status).json({ error: msg });

function authed(req: any) {
  const t = (req.headers.authorization || '').replace('Bearer ', '');
  return t && t === process.env.ADMIN_TOKEN;
}

function toBool(v: any) {
  return String(v).trim().toLowerCase() === 'true' || v === '1' || v === 'yes';
}
function toDirectDriveUrl(u?: string) {
  if (!u) return u;
  const m = u.match(/\/d\/([^/]+)/);
  return m?.[1] ? `https://drive.google.com/uc?export=view&id=${m[1]}` : u;
}
function splitUrls(s?: string) {
  if (!s) return [];
  return s.split(/[,|\n]/).map(x => x.trim()).filter(Boolean);
}

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
    images: dedup,
    img: dedup[0] || '',
    active: row.active === undefined ? true : toBool(row.active),
    createdAt: row.created_at || new Date().toISOString(),
    description: row.description || '',
  };
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const sheets = await getSheets(); // ← ensures we’re authenticated

  if (req.method === "GET") {
    const range = `${SHEET_NAME}!A1:Z10000`;
    const r = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range });
    const values = r.data.values || [];
    const [header, ...rows] = values;
  
    const items = rows.map((row) => {
      const o: Record<string, any> = {};
      header.forEach((h, i) => (o[h] = row[i]));
      return normalize(o);
    });
  
    const all = String(req.query.all || "").trim() === "1";
    return ok(res, all ? items : items.filter(i => i.active));
  }  

  if (req.method === 'POST') {
    if (!authed(req)) return bad(res, 'unauthorized', 401);
    const payload = req.body || {};
    if (!payload.title || !payload.price || !payload.status || !payload.priceUnit)
      return bad(res, 'missing required fields: title, price, status, priceUnit');

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
      '',
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
    if (!authed(req)) return bad(res, 'unauthorized', 401);
  
    const id = String((req.body || {}).id || req.query.id || '');
    const active = (req.body || {}).active;
    if (!id) return bad(res, 'missing id');
  
    const r = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A1:Z10000`,
    });
    const values = r.data.values || [];
    const [header, ...rows] = values;
  
    const idIdx = header.indexOf('id');
    const activeIdx = header.indexOf('active');
    if (idIdx < 0 || activeIdx < 0) return bad(res, 'sheet missing id/active columns', 500);
  
    const rowIndex = rows.findIndex((row) => String(row[idIdx]) === id);
    if (rowIndex < 0) return bad(res, 'id not found', 404);
  
    const colLetter = String.fromCharCode(65 + activeIdx);
    const targetRange = `${SHEET_NAME}!${colLetter}${rowIndex + 2}`;
  
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: targetRange,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[active ? 'TRUE' : 'FALSE']] },
    });
  
    return ok(res, { id, active: !!active });
  }
  
  if (req.method === 'DELETE') {
    if (!authed(req)) return bad(res, 'unauthorized', 401);
  
    const id = String((req.body || {}).id || req.query.id || '');
    if (!id) return bad(res, 'missing id');
  
    // Find row to delete
    const r = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A1:Z10000`,
    });
    const values = r.data.values || [];
    const [header, ...rows] = values;
  
    const idIdx = header.indexOf('id');
    if (idIdx < 0) return bad(res, 'sheet missing id column', 500);
  
    const rowIndex = rows.findIndex((row) => String(row[idIdx]) === id);
    if (rowIndex < 0) return bad(res, 'id not found', 404);
  
    // We need the sheetId (gid) for batchUpdate
    const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
    const sheet = meta.data.sheets?.find(s => s.properties?.title === SHEET_NAME);
    const sheetId = sheet?.properties?.sheetId;
    if (sheetId == null) return bad(res, 'sheet not found by name', 500);
  
    // Delete the data row (+1 because header is row 0 in the grid)
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex: rowIndex + 1,
              endIndex: rowIndex + 2,
            }
          }
        }]
      }
    });
  
    return ok(res, { id, deleted: true });
  }
  


  // helper: A1 column letters for any width
// helper: convert index -> A1 column
const toA1 = (n: number) => {
    let s = "";
    while (n > 0) { const r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); }
    return s;
  };
  
  if (req.method === "PUT") {
    if (!authed(req)) return bad(res, "unauthorized", 401);
    const u = req.body || {};
    const id = String(u.id || req.query.id || "");
    if (!id) return bad(res, "missing id");
  
    const r = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: `${SHEET_NAME}!A1:Z10000` });
    const values = r.data.values || [];
    const [header, ...rows] = values;
  
    const idIdx = header.indexOf("id");
    if (idIdx < 0) return bad(res, "sheet missing id column", 500);
  
    const rowIndex = rows.findIndex(row => String(row[idIdx]) === id);
    if (rowIndex < 0) return bad(res, "id not found", 404);
  
    const current: Record<string, any> = {};
    header.forEach((h, i) => (current[h] = rows[rowIndex][i] ?? ""));
  
    const set = (k: string, v: any) => { if (v !== undefined) current[k] = v; };
    set("title", u.title);
    set("address", u.address);
    set("area", u.area);
    set("price", u.price);
    set("price_unit", u.priceUnit);
    set("status", u.status);
    set("beds", u.beds);
    set("baths", u.baths);
    if (u.coord) { set("lat", u.coord[0]); set("lng", u.coord[1]); }
    if (typeof u.featured !== "undefined") set("featured", u.featured ? "TRUE" : "FALSE");
    set("description", u.description);
  
    if (Array.isArray(u.images)) {
      const imgs: string[] = (u.images as string[]).slice(0, 6);
      ["image_url","image_url_2","image_url_3","image_url_4","image_url_5","image_url_6"].forEach((k, i) => {
        current[k] = imgs[i] || "";
      });
      current["images_csv"] = "";
    }
  
    const updatedRow = header.map(h => {
      if (["price","beds","baths","lat","lng"].includes(h)) return Number(current[h] || 0);
      return current[h] ?? "";
    });
  
    const lastCol = toA1(header.length);
    const writeRange = `${SHEET_NAME}!A${rowIndex + 2}:${lastCol}${rowIndex + 2}`;
  
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: writeRange,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [updatedRow] },
    });
  
    return ok(res, { id, updated: true });
  }
  

  return bad(res, 'method not allowed', 405);
}
