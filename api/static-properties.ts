import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../lib/db';
import { properties } from '../lib/schema';
import { eq, desc } from 'drizzle-orm';

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

// This endpoint will be called at build time to generate static data
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const items = await db.select().from(properties)
      .where(eq(properties.active, true))
      .orderBy(desc(properties.createdAt));
    
    const normalized = items.map(normalizeForClient);
    
    // Set cache headers for static generation
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).json(normalized);
  } catch (error) {
    console.error('Error fetching properties for static generation:', error);
    res.status(500).json({ error: "Failed to fetch properties" });
  }
}
