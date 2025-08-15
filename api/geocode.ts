import type { VercelRequest, VercelResponse } from '@vercel/node';

const ok = (res: VercelResponse, data: any, status = 200) => res.status(status).json(data);
const bad = (res: VercelResponse, msg: string, status = 400) => res.status(status).json({ error: msg });

// Detect a UK outcode (partial postcode like "HA3", "SW1", "EC1A") and return it normalized (no spaces, uppercased).
function extractUKOutcode(input: string): string | null {
  // UK outcode formats: A9, A99, AA9, AA99, A9A, AA9A
  const match = input.toUpperCase().match(/(^|\s)([A-Z]{1,2}\d{1,2}[A-Z]?)(?=\s|$)/);
  if (!match) return null;
  return match[2].replace(/\s+/g, '');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return bad(res, 'Method not allowed', 405);

  const address = (req.query.address as string) || '';
  if (address.trim().length < 3) {
    return bad(res, 'Address must be at least 3 characters long');
  }

  try {
    // --- 1) Try OpenStreetMap Nominatim ---
    const encodedAddress = encodeURIComponent(address.trim());

    // Your original UK full-postcode hint
    const isLikelyUKFullPostcode = /\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/i.test(address);
    const countryCode = isLikelyUKFullPostcode ? '&countrycodes=gb' : '';

    const osmResp = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&addressdetails=1${countryCode}`,
      {
        headers: {
          'User-Agent': 'ManagementProperties/1.0', // required by Nominatim usage policy
        },
      }
    );

    if (!osmResp.ok) {
      throw new Error(`Geocoding service error: ${osmResp.status}`);
    }

    const osmData = (await osmResp.json()) as any[];
    if (Array.isArray(osmData) && osmData.length > 0) {
      const result = osmData[0];
      const lat = parseFloat(result.lat);
      const lng = parseFloat(result.lon);

      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        return ok(res, {
          lat,
          lng,
          provider: 'osm',
          formatted_address: result.display_name,
          address_components: result.address,
        });
      }
    }

    // --- 2) Fallback to Postcodes.io outcodes for UK partials ---
    // If OSM didn't return anything, try to interpret the input as a UK outcode (e.g. "HA3").
    const outcode = extractUKOutcode(address);
    if (outcode) {
      const pcResp = await fetch(`https://api.postcodes.io/outcodes/${encodeURIComponent(outcode)}`);
      if (pcResp.ok) {
        const pcJson = await pcResp.json();
        const result = pcJson?.result;
        const lat = result?.latitude;
        const lng = result?.longitude;

        if (typeof lat === 'number' && typeof lng === 'number') {
          return ok(res, {
            lat,
            lng,
            provider: 'postcodes.io',
            formatted_address: `Outcode ${result.outcode}`, // centroid of the outcode area
          });
        }
      } else if (pcResp.status !== 404) {
        // Non-404 errors from postcodes.io should be surfaced
        const t = await pcResp.text().catch(() => '');
        throw new Error(`Postcodes.io error: ${pcResp.status} ${t}`);
      }
    }

    // If still nothing:
    return bad(res, 'No coordinates found for this address', 404);
  } catch (error: any) {
    console.error('Geocoding error:', error);
    return bad(res, `Geocoding failed: ${error.message}`, 500);
  }
}
