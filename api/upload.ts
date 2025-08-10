// api/upload.ts
import { put } from '@vercel/blob';
export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      },
    });
  }
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (token !== process.env.ADMIN_TOKEN)
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });

  const url = new URL(req.url);
  const filenameRaw = url.searchParams.get('filename') ?? `file-${Date.now()}`;
  const safe = filenameRaw.replace(/[^\w.\-]+/g, '_');

  try {
    const blob = await put(`properties/${safe}`, req.body!, {
      access: 'public',
      addRandomSuffix: true,
      contentType: req.headers.get('content-type') ?? undefined,
    });
    return new Response(JSON.stringify(blob), {
      status: 201,
      headers: {
        'content-type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (e: any) {
    console.error('Blob put failed', e);
    return new Response(JSON.stringify({ error: 'upload failed' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}
