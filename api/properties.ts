import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../lib/db';
import { properties } from '../lib/schema';
import { eq, desc } from 'drizzle-orm';

const ok = (res: VercelResponse, data: any, status = 200) => res.status(status).json(data);
const bad = (res: VercelResponse, msg: string, status = 400) => res.status(status).json({ error: msg });

function authed(req: VercelRequest) {
  const t = (req.headers.authorization || '').replace('Bearer ', '');
  return t && t === process.env.ADMIN_TOKEN;
}

function normalizeForClient(p: typeof properties.$inferSelect) {
  const images = p.images || [];
  return {
    id: p.id,
    title: p.title,
    address: p.address || '',
    area: p.area || '',
    price: p.price,
    priceUnit: p.priceUnit,
    salePriceUnit: p.salePriceUnit,
    status: p.status,
  availability: (p as any).availability || undefined,
    beds: p.beds || 0,
    baths: p.baths || 0,
    featured: p.featured || false,
    coord: [p.lat || 0, p.lng || 0] as [number, number],
    images: images,
    img: images[0] || '',
    active: p.active,
    createdAt: p.createdAt?.toISOString() || new Date().toISOString(),
    description: p.description || '',
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === "GET") {
    const all = String(req.query.all || "").trim() === "1";
    const query = db.select().from(properties).orderBy(desc(properties.createdAt));
    
    const items = all ? await query : await query.where(eq(properties.active, true));
    
    return ok(res, items.map(normalizeForClient));
  }

  if (!authed(req)) return bad(res, 'unauthorized', 401);

  if (req.method === 'POST') {
    const payload = req.body || {};
    if (!payload.title || !payload.price || !payload.status || !payload.priceUnit)
      return bad(res, 'missing required fields: title, price, status, priceUnit');

    const [newItem] = await db.insert(properties).values({
      title: payload.title,
      address: payload.address,
      area: payload.area,
      price: String(payload.price),
      priceUnit: payload.priceUnit,
      salePriceUnit: payload.salePriceUnit,
      status: payload.status,
      availability: payload.availability ?? null,
      beds: Number(payload.beds),
      baths: Number(payload.baths),
      featured: !!payload.featured,
      lat: String(payload.coord?.[0] ?? 0),
      lng: String(payload.coord?.[1] ?? 0),
      images: payload.images || [],
      description: payload.description,
      active: true,
    }).returning();

    return ok(res, { id: newItem.id }, 201);
  }

  if (req.method === 'PATCH') {
    const id = Number((req.body || {}).id || req.query.id);
    const active = (req.body || {}).active;
    if (!id) return bad(res, 'missing id');

    await db.update(properties)
      .set({ active: !!active })
      .where(eq(properties.id, id));

    return ok(res, { id, active: !!active });
  }
  
  if (req.method === 'DELETE') {
    const id = Number((req.body || {}).id || req.query.id);
    if (!id) return bad(res, 'missing id');
  
    await db.delete(properties).where(eq(properties.id, id));
  
    return ok(res, { id, deleted: true });
  }
  
  if (req.method === "PUT") {
    const u = req.body || {};
    const id = Number(u.id || req.query.id);
    if (!id) return bad(res, "missing id");
  
    await db.update(properties).set({
      title: u.title,
      address: u.address,
      area: u.area,
      price: String(u.price),
      priceUnit: u.priceUnit,
      salePriceUnit: u.salePriceUnit,
      status: u.status,
      availability: u.availability ?? null,
      beds: Number(u.beds),
      baths: Number(u.baths),
      featured: !!u.featured,
      lat: String(u.coord?.[0] ?? 0),
      lng: String(u.coord?.[1] ?? 0),
      images: u.images,
      description: u.description,
    }).where(eq(properties.id, id));
  
    return ok(res, { id, updated: true });
  }

  return bad(res, 'method not allowed', 405);
}
