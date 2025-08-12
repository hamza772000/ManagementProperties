// api/upload.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(200)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
      .end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const filenameRaw = (req.query?.filename as string) ?? `file-${Date.now()}`;
  const safe = filenameRaw.replace(/[^\w.\-]+/g, '_');

  try {
    const chunks: Buffer[] = [];

    await new Promise<void>((resolve, reject) => {
      req.on('data', (chunk: Buffer) => chunks.push(chunk));
      req.on('end', async () => {
        try {
          const body = Buffer.concat(chunks);
          if (body.length === 0) {
            res.status(400).json({ error: 'No file data received' });
            return resolve();
          }

          const blob = await put(`properties/${safe}`, body, {
            access: 'public',
            addRandomSuffix: true,
            contentType: req.headers['content-type'] || 'application/octet-stream',
          });

          res.status(201)
            .setHeader('Content-Type', 'application/json')
            .setHeader('Access-Control-Allow-Origin', '*')
            .json(blob);
          resolve();
        } catch (e: any) {
          console.error('Blob put failed', e);
          res.status(500).json({ error: 'upload failed', details: e.message });
          reject(e);
        }
      });
      req.on('error', (err: Error) => {
        console.error('Request stream error', err);
        res.status(500).json({ error: 'request failed', details: err.message });
        reject(err);
      });
    });
  } catch (e: any) {
    console.error('Handler error', e);
    if (!res.headersSent) {
      res.status(500).json({ error: 'upload failed', details: e.message });
    }
  }
}
