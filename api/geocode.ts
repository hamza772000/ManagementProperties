import type { VercelRequest, VercelResponse } from '@vercel/node';

const ok = (res: VercelResponse, data: any, status = 200) => res.status(status).json(data);
const bad = (res: VercelResponse, msg: string, status = 400) => res.status(status).json({ error: msg });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') {
    return bad(res, 'Method not allowed', 405);
  }

  const address = req.query.address as string;
  
  if (!address || address.trim().length < 3) {
    return bad(res, 'Address must be at least 3 characters long');
  }

  try {
    // Using OpenStreetMap Nominatim API (free, no API key required)
    const encodedAddress = encodeURIComponent(address.trim());
    
    // For UK addresses, add country constraint to improve results
    const isLikelyUKPostcode = /\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/i.test(address);
    const countryCode = isLikelyUKPostcode ? '&countrycodes=gb' : '';
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&addressdetails=1${countryCode}`,
      {
        headers: {
          'User-Agent': 'ManagementProperties/1.0', // Required by Nominatim
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Geocoding service error: ${response.status}`);
    }

    const data = await response.json() as any[];
    
    if (!data || data.length === 0) {
      return bad(res, 'No coordinates found for this address', 404);
    }

    const result = data[0];
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    if (isNaN(lat) || isNaN(lng)) {
      return bad(res, 'Invalid coordinates received from geocoding service');
    }

    return ok(res, {
      lat,
      lng,
      formatted_address: result.display_name,
      address_components: result.address
    });

  } catch (error: any) {
    console.error('Geocoding error:', error);
    return bad(res, `Geocoding failed: ${error.message}`, 500);
  }
}
