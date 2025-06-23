import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3ZnJjaGxpbWF1Z3Fub3N2bWJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4MTI1MTQsImV4cCI6MjA2MDM4ODUxNH0.iuCiOJeQdEr_2s-Ighup4vpYrRgoSEcNSopbBri3wYI';
    
    let targetUrl: string;
    let method = req.method || 'GET';
    let body: any = undefined;
    let headers: any = {};

    if (req.method === 'GET') {
      // For GET requests, URL is in query parameter
      targetUrl = req.query.url as string;
    } else {
      // For POST/PUT/DELETE, data is in request body
      const requestData = req.body;
      targetUrl = requestData.url;
      method = requestData.method || method;
      body = requestData.body;
      headers = requestData.headers || {};
    }

    // Validate that the URL is for our Supabase instance
    if (!targetUrl || !targetUrl.includes('gwfrchlimaugqnosvmbs.supabase.co')) {
      return res.status(400).json({ error: 'Invalid URL' });
    }

    // Forward the request to Supabase
    const response = await fetch(targetUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: 'Proxy request failed' });
  }
}