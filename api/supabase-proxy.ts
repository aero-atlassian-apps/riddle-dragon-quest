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
    console.log('Proxy function invoked:', { method: req.method, url: req.url });
    
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3ZnJjaGxpbWF1Z3Fub3N2bWJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4MTI1MTQsImV4cCI6MjA2MDM4ODUxNH0.iuCiOJeQdEr_2s-Ighup4vpYrRgoSEcNSopbBri3wYI';
    
    let targetUrl: string;
    let method = req.method || 'GET';
    let body: any = undefined;
    let headers: any = {};

    if (req.method === 'GET') {
      // For GET requests, URL is in query parameter
      targetUrl = req.query.url as string;
      console.log('GET request targetUrl:', targetUrl);
    } else {
      // For POST/PUT/DELETE, data is in request body
      if (!req.body) {
        console.error('No request body found for non-GET request');
        return res.status(400).json({ error: 'Request body required for non-GET requests' });
      }
      
      const requestData = req.body;
      targetUrl = requestData.url;
      method = requestData.method || method;
      body = requestData.body;
      headers = requestData.headers || {};
      console.log('Non-GET request:', { targetUrl, method, hasBody: !!body });
    }

    // Validate that the URL is for our Supabase instance
    if (!targetUrl) {
      console.error('No target URL provided');
      return res.status(400).json({ error: 'URL parameter is required' });
    }
    
    if (!targetUrl.includes('gwfrchlimaugqnosvmbs.supabase.co')) {
      console.error('Invalid URL domain:', targetUrl);
      return res.status(400).json({ error: 'Invalid URL - must be Supabase domain' });
    }

    // Forward the request to Supabase
    console.log('Forwarding request to Supabase:', { targetUrl, method });
    
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

    console.log('Supabase response status:', response.status);
    
    if (!response.ok) {
      console.error('Supabase request failed:', response.status, response.statusText);
    }
    
    const data = await response.json();
    console.log('Returning response with status:', response.status);
    
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    });
    
    return res.status(500).json({ 
      error: 'Proxy request failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}