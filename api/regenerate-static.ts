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

async function regenerateStaticData() {
  try {
    const items = await db.select().from(properties)
      .where(eq(properties.active, true))
      .orderBy(desc(properties.createdAt));
    
    const normalized = items.map(normalizeForClient);
    
    // In production, we can't write to the filesystem directly
    // But we can trigger a revalidation or return the fresh data
    return normalized;
  } catch (error) {
    console.error('Error regenerating static data:', error);
    throw error;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const freshData = await regenerateStaticData();
    
    // Set cache headers to bust any existing cache
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    res.status(200).json({ 
      success: true, 
      count: freshData.length,
      data: freshData 
    });
  } catch (error) {
    console.error('Failed to regenerate static data:', error);
    res.status(500).json({ error: 'Failed to regenerate static data' });
  }
}
