import type { VercelRequest, VercelResponse } from '@vercel/node';

function authed(req: VercelRequest) {
  const t = (req.headers.authorization || '').replace('Bearer ', '');
  return t && t === process.env.ADMIN_TOKEN;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });
  if (!authed(req)) return res.status(401).json({ error: 'unauthorized' });

  const hook = process.env.DEPLOY_HOOK_URL; // Configure this in Vercel Project Settings
  if (!hook) return res.status(500).json({ error: 'DEPLOY_HOOK_URL not configured' });
  try {
    const r = await fetch(hook, { method: 'POST' });
    if (!r.ok) throw new Error(`Deploy hook failed: ${r.status}`);
    return res.status(200).json({ triggered: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'deploy trigger failed' });
  }
}
