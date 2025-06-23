export const config = { runtime: 'edge' };

// Get environment variables (Edge Runtime compatible)
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3ZnJjaGxpbWF1Z3Fub3N2bWJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4MTI1MTQsImV4cCI6MjA2MDM4ODUxNH0.iuCiOJeQdEr_2s-Ighup4vpYrRgoSEcNSopbBri3wYI';

export default async function handler(req: Request) {
  console.log('🔄 Proxy function invoked:', req.method, req.url);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info, x-supabase-auth-token',
      },
    });
  }

  try {
    let targetUrl: string;
    let requestMethod: string;
    let requestHeaders: Record<string, string> = {};
    let requestBody: any;

    if (req.method === 'GET') {
      // Handle GET requests with URL parameter
      const url = new URL(req.url);
      targetUrl = url.searchParams.get('url') || '';
      requestMethod = 'GET';
      
      // Forward original headers
      req.headers.forEach((value, key) => {
        if (key.toLowerCase() !== 'host' && key.toLowerCase() !== 'origin') {
          requestHeaders[key] = value;
        }
      });
    } else {
      // Handle POST/PUT/DELETE requests with body
      const requestData = await req.json();
      targetUrl = requestData.url || '';
      requestMethod = requestData.method || req.method;
      requestHeaders = requestData.headers || {};
      requestBody = requestData.body;
      
      // Forward original headers and merge with provided headers
      req.headers.forEach((value, key) => {
        if (key.toLowerCase() !== 'host' && key.toLowerCase() !== 'origin' && key.toLowerCase() !== 'content-length') {
          requestHeaders[key] = value;
        }
      });
    }
    
    console.log('🎯 Target URL:', targetUrl);
    console.log('📋 Method:', requestMethod);
    console.log('📝 Headers:', Object.keys(requestHeaders));
    
    // Validate that the URL is for our Supabase instance
    if (!targetUrl || !targetUrl.includes('gwfrchlimaugqnosvmbs.supabase.co')) {
      console.error('❌ Invalid URL:', targetUrl);
      return new Response(JSON.stringify({ error: 'Invalid URL' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Ensure required Supabase headers are present
    const supabaseHeaders = {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      ...requestHeaders,
    };

    // If no Authorization header but we have apikey, set it
    if (!supabaseHeaders['Authorization'] && !supabaseHeaders['authorization']) {
      supabaseHeaders['Authorization'] = `Bearer ${SUPABASE_KEY}`;
    }

    console.log('🔑 Using API key:', SUPABASE_KEY.substring(0, 20) + '...');
    
    // Forward the request to Supabase
    const fetchOptions: RequestInit = {
      method: requestMethod,
      headers: supabaseHeaders,
    };

    if (requestBody && requestMethod !== 'GET' && requestMethod !== 'HEAD') {
      fetchOptions.body = typeof requestBody === 'string' ? requestBody : JSON.stringify(requestBody);
      console.log('📦 Request body length:', fetchOptions.body.length);
    }

    console.log('🚀 Making request to Supabase...');
    const response = await fetch(targetUrl, fetchOptions);
    
    console.log('📡 Supabase response status:', response.status, response.statusText);

    let responseData;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }
    
    console.log('✅ Response received, status:', response.status);
    
    return new Response(JSON.stringify(responseData), {
      status: response.status,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info, x-supabase-auth-token',
      },
    });
  } catch (error) {
    console.error('❌ Proxy error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return new Response(JSON.stringify({ 
      error: 'Proxy request failed',
      details: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}